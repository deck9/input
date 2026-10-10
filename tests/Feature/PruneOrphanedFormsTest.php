<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormBlockLogic;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\FormSessionUpload;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake();
    $this->uploads = [];

    // a form with a logic rule and a submission with an uploaded file
    $createForm = function (Team $team, array $attributes) {
        $form = Form::factory()->create(['team_id' => $team->id, ...$attributes]);

        $block = FormBlock::factory()->for($form)->create(['type' => FormBlockType::file]);
        $interaction = FormBlockInteraction::factory()->for($block)->create();
        FormBlockLogic::factory()->for($block)->create();

        $this->uploads[$form->id] = FormSession::factory()->for($form)->completed()->create()->formSessionResponses()->create([
            'form_block_id' => $block->id,
            'form_block_interaction_id' => $interaction->id,
            'value' => 'cv.pdf',
        ])->saveUpload(UploadedFile::fake()->create('cv.pdf'))->path;

        return $form;
    };

    $liveTeam = User::factory()->withTeam()->create()->currentTeam;
    $deletedTeam = User::factory()->withTeam()->create()->currentTeam;

    $this->liveForm = $createForm($liveTeam, ['name' => 'Live team form', 'avatar_path' => 'shared/avatar.png']);
    $this->orphanedForm = $createForm($deletedTeam, [
        'avatar_path' => 'shared/avatar.png',
        'background_path' => 'orphaned/background.png',
    ]);
    $this->trashedOrphanedForm = Form::factory()->deleted()->create(['team_id' => $deletedTeam->id]);
    // a visit without a submission, not counted
    FormSession::factory()->for($this->orphanedForm)->create();

    Storage::put('shared/avatar.png', 'image');
    Storage::put('orphaned/background.png', 'image');

    // deleting a team before v2.2 removed only the team row and left its forms behind
    $deletedTeam->purge();
});

test('without --force it lists the forms of deleted teams and deletes nothing', function () {
    $rowCounts = fn () => [
        Form::withTrashed()->count(),
        FormSession::count(),
        FormSessionResponse::count(),
        FormSessionUpload::count(),
        FormBlockLogic::count(),
    ];
    $before = $rowCounts();

    $this->artisan('input:prune-orphaned-forms')
        ->expectsTable(['ID', 'Name', 'Submissions', 'Uploaded files'], [
            [$this->orphanedForm->id, $this->orphanedForm->name, 1, 1],
            [$this->trashedOrphanedForm->id, $this->trashedOrphanedForm->name, 0, 0],
        ])
        ->doesntExpectOutputToContain('Live team form')
        ->expectsOutputToContain('nothing was deleted')
        ->assertSuccessful();

    expect($rowCounts())->toBe($before);
    Storage::assertExists([...$this->uploads, 'shared/avatar.png', 'orphaned/background.png']);
});

test('with --force it deletes the forms of deleted teams with their submissions, logic rules and files', function () {
    $this->artisan('input:prune-orphaned-forms --force')
        ->expectsOutputToContain('Deleted 2 forms')
        ->assertSuccessful();

    $liveFormId = $this->liveForm->id;

    expect(Form::withTrashed()->pluck('id')->all())->toBe([$liveFormId])
        ->and(FormSession::pluck('form_id')->all())->toBe([$liveFormId])
        ->and(FormSessionResponse::count())->toBe(1)
        ->and(FormSessionUpload::pluck('path')->all())->toBe([$this->uploads[$liveFormId]])
        ->and(FormBlockLogic::with('formBlock')->get()->pluck('formBlock.form_id')->all())->toBe([$liveFormId]);

    Storage::assertMissing([$this->uploads[$this->orphanedForm->id], 'orphaned/background.png']);
    // the live team's form still uses it
    Storage::assertExists([$this->uploads[$liveFormId], 'shared/avatar.png']);
});

// SQLite can't turn foreign keys off inside the test's transaction, but it can defer the check to a commit that never comes
function withoutForeignKeyChecks(Closure $callback): mixed
{
    if (DB::getDriverName() === 'sqlite') {
        DB::statement('PRAGMA defer_foreign_keys = ON');

        return $callback();
    }

    return Schema::withoutForeignKeyConstraints($callback);
}

test('it lists rows that earlier deletes left behind, and with --force deletes only them with their files', function () {
    $this->artisan('input:prune-orphaned-forms --force')->assertSuccessful();

    $liveResponse = FormSessionResponse::whereHas('formSession', fn ($query) => $query->where('form_id', $this->liveForm->id))->sole();
    // a trashed form of a live team is not left behind
    FormBlock::factory()->for(Form::factory()->deleted()->create(['team_id' => $this->liveForm->team_id]))->create();

    // installs without foreign keys kept these when their parent was deleted
    $leftovers = withoutForeignKeyChecks(function () use ($liveResponse) {
        $gone = 999999;
        $live = $liveResponse->only(['form_session_id', 'form_block_id', 'form_block_interaction_id']);
        $block = FormBlock::factory()->create(['form_id' => $gone]);
        $session = FormSession::factory()->create(['form_id' => $gone]);
        $response = FormSessionResponse::factory()->create([...$live, 'form_session_id' => $session->id]);

        return [
            $block,
            FormBlockInteraction::factory()->for($block)->create(),
            FormBlockLogic::factory()->for($block)->create(),
            $session,
            $response,
            FormSessionResponse::factory()->create([...$live, 'form_block_id' => $block->id]),
            FormSessionResponse::factory()->create([...$live, 'form_block_interaction_id' => $gone]),
            $this->leftoverUpload = $response->saveUpload(UploadedFile::fake()->create('left.pdf')),
            // shares its file with the live form's upload
            FormSessionUpload::create([
                ...$liveResponse->formSessionUploads()->sole()->only(['name', 'path', 'type', 'size']),
                'uuid' => Str::uuid(),
                'form_session_response_id' => $gone,
            ]),
        ];
    });

    $models = [Form::class, FormBlock::class, FormBlockInteraction::class, FormBlockLogic::class, FormSession::class, FormSessionResponse::class, FormSessionUpload::class];
    $ids = fn () => collect($models)->mapWithKeys(fn ($model) => [$model => $model::withoutGlobalScopes()->orderBy('id')->pluck('id')->all()]);
    $before = $ids();

    $this->artisan('input:prune-orphaned-forms')
        ->expectsTable(['Table', 'Rows'], [
            ['form_session_uploads', 2],
            ['form_session_responses', 3],
            ['form_sessions', 1],
            ['form_block_logics', 1],
            ['form_block_interactions', 1],
            ['form_blocks', 1],
        ])
        ->expectsOutputToContain('nothing was deleted')
        ->assertSuccessful();

    expect($ids())->toEqual($before);
    Storage::assertExists($this->leftoverUpload->path);

    $this->artisan('input:prune-orphaned-forms --force')
        ->expectsOutputToContain('Deleted the rows left behind')
        ->assertSuccessful();

    $leftoverIds = collect($leftovers)->groupBy(fn ($row) => $row::class)->map->pluck('id');
    expect($ids())->toEqual($before->map(fn ($rows, $model) => array_values(array_diff($rows, $leftoverIds->get($model, collect())->all()))));
    Storage::assertMissing($this->leftoverUpload->path);
    Storage::assertExists($this->uploads[$this->liveForm->id]);

    $this->artisan('input:prune-orphaned-forms')
        ->expectsOutputToContain('No forms of deleted teams and no rows left behind found.')
        ->assertSuccessful();
});
