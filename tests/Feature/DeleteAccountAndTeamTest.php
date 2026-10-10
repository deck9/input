<?php

use App\Actions\Jetstream\DeleteTeam;
use App\Actions\Jetstream\DeleteUser;
use App\Actions\Jetstream\RemoveTeamMember;
use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormBlockLogic;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\FormSessionUpload;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->owner = User::factory()->withTeam()->create();
    $this->team = $this->owner->currentTeam;

    $this->member = User::factory()->withTeam()->create();
    $this->team->users()->attach($this->member, ['role' => 'editor']);

    $this->form = Form::factory()->create([
        'user_id' => $this->member->id,
        'team_id' => $this->team->id,
    ]);

    $this->assertFormLoads = function () {
        $this->actingAs($this->owner)
            ->json('GET', route('api.forms.index'))
            ->assertOk()
            ->assertJsonFragment(['uuid' => $this->form->uuid]);

        $this->get(route('forms.show', ['uuid' => $this->form->uuid]))->assertOk();
        $this->json('GET', route('api.public.forms.show', $this->form))->assertOk();
    };
});

test('after a member deletes their account, the team owner gets their forms and the forms still load', function () {
    $trashedForm = Form::factory()->deleted()->create([
        'user_id' => $this->member->id,
        'team_id' => $this->team->id,
    ]);

    app(DeleteUser::class)->delete($this->member);

    expect($this->form->fresh()->user_id)->toBe($this->owner->id)
        ->and($trashedForm->fresh()->user_id)->toBe($this->owner->id);

    ($this->assertFormLoads)();
});

test('a member who left the team before deleting their account hands their forms to the team owner', function () {
    app(RemoveTeamMember::class)->remove($this->owner, $this->team, $this->member);

    app(DeleteUser::class)->delete($this->member->fresh());

    expect($this->form->fresh()->user_id)->toBe($this->owner->id);
});

test('a form still loads when its creator is gone', function () {
    // older versions deleted the user and left the forms pointing to them
    $this->member->delete();

    ($this->assertFormLoads)();
});

test('deleting a team removes its forms, submissions and uploaded files', function () {
    Storage::fake();

    $block = FormBlock::factory()->for($this->form)->create(['type' => FormBlockType::file]);
    $interaction = FormBlockInteraction::factory()->for($block)->create();
    FormBlockLogic::factory()->for($block)->create();

    $response = FormSession::factory()->for($this->form)->create()->formSessionResponses()->create([
        'form_block_id' => $block->id,
        'form_block_interaction_id' => $interaction->id,
        'value' => 'cv.pdf',
    ]);
    $upload = $response->saveUpload(UploadedFile::fake()->create('cv.pdf'));

    $this->form->update(['avatar_path' => $this->form->uuid.'/avatar.png']);
    Storage::put($this->form->avatar_path, 'image');

    $trashedForm = Form::factory()->deleted()->create(['team_id' => $this->team->id]);

    app(DeleteTeam::class)->delete($this->team);

    expect(Form::withTrashed()->whereIn('id', [$this->form->id, $trashedForm->id])->count())->toBe(0)
        ->and(FormSession::count())->toBe(0)
        ->and(FormSessionResponse::count())->toBe(0)
        ->and(FormSessionUpload::count())->toBe(0)
        ->and(FormBlockLogic::count())->toBe(0);

    Storage::assertMissing($upload->path);
    Storage::assertMissing($this->form->avatar_path);
});
