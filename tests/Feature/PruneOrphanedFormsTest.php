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
use Illuminate\Support\Facades\Storage;

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

        $this->uploads[$form->id] = FormSession::factory()->for($form)->create()->formSessionResponses()->create([
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
