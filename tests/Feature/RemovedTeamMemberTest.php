<?php

use App\Actions\Jetstream\RemoveTeamMember;
use App\Mail\FormSubmissionNotification;
use App\Models\Form;
use App\Models\FormSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->owner = User::factory()->withTeam()->create();

    // the member has a team of their own, so they keep api access after leaving
    $this->member = User::factory()->withTeam()->create();
    $this->owner->currentTeam->users()->attach($this->member, ['role' => 'editor']);
    $this->member->switchTeam($this->owner->currentTeam);

    $this->form = Form::factory()->create([
        'user_id' => $this->member->id,
        'team_id' => $this->owner->current_team_id,
        'is_notification_via_mail' => true,
    ]);

    app(RemoveTeamMember::class)->remove($this->owner, $this->owner->currentTeam, $this->member);
    $this->member->refresh();
});

test('a removed member loses access to the forms they created', function () {
    $this->actingAs($this->member);

    $this->json('get', route('api.forms.show', $this->form))->assertStatus(403);
    $this->json('post', route('api.forms.update', $this->form), ['name' => 'Still mine'])->assertStatus(403);
    $this->json('delete', route('api.forms.delete', $this->form))->assertStatus(403);
    $this->json('get', route('api.forms.submissions', $this->form))->assertStatus(404);
    $this->json('post', route('api.forms.trashed.restore', $this->form))->assertStatus(404);

    $this->assertNotEquals('Still mine', $this->form->fresh()->name);
    $this->assertNull($this->form->fresh()->deleted_at);
});

test('a removed member gets no more submission mails, the team owner gets them', function () {
    Mail::fake();

    $session = FormSession::factory()->for($this->form)->create();

    $this->json('post', route('api.public.forms.submit', $this->form), [
        'token' => $session->token,
        'payload' => [],
    ])->assertStatus(200);

    Mail::assertQueued(FormSubmissionNotification::class, fn ($mail) => $mail->hasTo($this->owner->email));
    Mail::assertNotQueued(FormSubmissionNotification::class, fn ($mail) => $mail->hasTo($this->member->email));
});
