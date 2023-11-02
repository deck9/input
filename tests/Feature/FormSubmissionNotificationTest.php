<?php

namespace Tests\Feature;

use App\Mail\FormSubmissionNotification;
use App\Models\Form;
use App\Models\FormSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mail;

uses(RefreshDatabase::class);

it('can activate notifications for form submissions', function () {
    $form = Form::factory()->create();

    $updateRequestA = [
        'is_notification_via_mail' => true,
    ];

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), $updateRequestA);

    // refresh form
    $form = $form->fresh();
    $this->assertTrue($form->is_notification_via_mail);

    $updateRequestB = [
        'is_notification_via_mail' => false,
    ];

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), $updateRequestB);

    // refresh form
    $form = $form->fresh();
    $this->assertNotTrue($form->is_notification_via_mail);
});

it('send an email notification for a submitted form', function () {
    Mail::fake();

    $form = Form::factory()->create([
        'is_notification_via_mail' => true,
    ]);

    $session = FormSession::factory()->create([
        'form_id' => $form->id,
    ]);

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [],
    ])->assertStatus(200);

    Mail::assertQueued(FormSubmissionNotification::class);
});
