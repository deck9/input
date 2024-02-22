<?php

namespace Tests\Feature;

use App\Events\FormSessionCompletedEvent;
use App\Listeners\FormSubmitWebhookListener;
use App\Models\Form;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

dataset('templates', [
    '{"name":"MailFrog Newsletter Sign-Up","description":"Test","eoc_text":"To complete the signup for our newsletter, we send you an email with a link to confirm your address.","eoc_headline":"Please check your inbox","cta_label":"Go To Homepage","cta_link":"https://getinput.co","linkedin":null,"github":null,"instagram":null,"facebook":null,"twitter":null,"show_cta_link":false,"show_social_links":false,"blocks":[{"message":"<p>Hey, thanks for your interest in the MailFrog newsletter.</p><p><strong>Please insert your e-mail address.</strong></p>","type":"input-email","title":null,"parent_block":null,"sequence":0,"formBlockInteractions":[{"type":"input","label":"froggy@mailfrog.com","message":null,"sequence":0}]},{"message":"<p><strong>Thank You! 🐸🐸🐸</strong><br>After confirming your email, we subscribe you to our list. Do you mind answering a few questions?</p>","type":"none","title":null,"parent_block":null,"sequence":1,"formBlockInteractions":[]},{"message":"<p>Is this the first time you are visiting <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"http://mailfrog.com\">mailfrog.com</a>?</p>","type":"radio","title":null,"parent_block":null,"sequence":2,"formBlockInteractions":[{"type":"button","label":"Yes","message":null,"sequence":0},{"type":"button","label":"No","message":null,"sequence":1}]},{"message":"<p><strong>What feature do you wish, MailFrog would offer?</strong></p>","type":"checkbox","title":null,"parent_block":null,"sequence":3,"formBlockInteractions":[{"type":"button","label":"Transactional Mailing","message":null,"sequence":0},{"type":"button","label":"Template API","message":null,"sequence":1},{"type":"button","label":"Inbound Mail","message":null,"sequence":2},{"type":"button","label":"Spam Protection","message":null,"sequence":3}]}]}',
]);

test('can create a new form session', function () {
    $form = Form::factory()->create();

    $response = $this->json('POST', route('api.public.forms.session.create', [
        'form' => $form->uuid,
    ]))->assertStatus(201);

    $this->assertNotNull($response->json('token'));
    $this->assertEquals(32, strlen($response->json('token')));
});

test('parameters can be saved with new session', function () {
    $form = Form::factory()->create();

    $this->json('POST', route('api.public.forms.session.create', [
        'form' => $form->uuid,
        'params' => [
            'foo' => 'bar',
            'boo' => 'faz',
        ],
    ]))->assertStatus(201);

    $session = $form->fresh()->formSessions()->first();
    $this->assertCount(2, $session->params);
});

test('create session only return whitelisted attributes in response', function () {
    $form = Form::factory()->create();

    $this->json('POST', route('api.public.forms.session.create', [
        'form' => $form->uuid,
        'params' => [
            'foo' => 'bar',
            'boo' => 'faz',
        ],
    ]))
        ->assertStatus(201)
        // id and created_at are not whitelisted
        ->assertJsonMissing(['id', 'created_at'])
        ->assertJsonStructure([
            'token',
            'has_data_privacy',
            'is_completed',
            'params',
            'created_at',
        ]);
});

test('can submit a form through a session token', function ($template) {
    $form = Form::factory()->create();
    $form->applyTemplate($template);

    $session = FormSession::factory()->create(['form_id' => $form->id]);

    $submitted = $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [
            ...$form->formBlocks[0]->getSubmitPayload('tester@example.com'),
            ...$form->formBlocks[2]->getSubmitPayload([0]),
            ...$form->formBlocks[3]->getSubmitPayload([0, 1]),
        ],
    ])->assertStatus(200);

    $form->refresh();
    $this->assertCount(
        1,
        $form->formBlocks[0]
            ->formBlockInteractions[0]
            ->formSessionResponses
    );
    $this->assertCount(4, $form->formSessionResponses);
    $this->assertTrue($submitted->json('is_completed'));
})->with('templates');

test('submitting a session a second time does not create duplicate responses', function ($template) {
    $form = Form::factory()->create();
    $form->applyTemplate($template);

    $session = FormSession::factory()->create(['form_id' => $form->id]);

    $route = route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]);

    $request = [
        'token' => $session->token,
        'payload' => [
            ...$form->formBlocks[0]->getSubmitPayload('tester@example.com'),
            ...$form->formBlocks[2]->getSubmitPayload([0]),
            ...$form->formBlocks[3]->getSubmitPayload([0, 1]),
        ],
    ];

    // Submit twice
    $this->json('POST', $route, $request)->assertStatus(200);
    $this->json('POST', $route, $request)->assertStatus(200);

    $this->assertCount(
        1,
        $form->formBlocks[0]
            ->formBlockInteractions[0]
            ->formSessionResponses
    );
})->with('templates');

test('a session token must be valid', function () {
    $form = Form::factory()->create();

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [
        'token' => 'invalid-token',
        'payload' => [],
    ])
        ->assertStatus(404);
});

test('can not submit a form without a session token', function () {
    $form = Form::factory()->create();

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [])
        ->assertStatus(422)
        ->assertJsonValidationErrors('token');
});

test('can submit a form without payload when no input required', function () {
    $session = FormSession::factory()->create();

    $submitted = $this->json('POST', route('api.public.forms.submit', [
        'form' => $session->form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [],
    ])->assertStatus(200);

    $this->assertTrue($submitted->json('is_completed'));
});

test('when submitting a form an event is fired', function () {
    Event::fake();

    $session = FormSession::factory()->create();

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $session->form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [],
    ])->assertStatus(200);

    Event::assertListening(FormSessionCompletedEvent::class, FormSubmitWebhookListener::class);
});

it('should delete old submissions if auto delete is enabled for the form after specified time', function ($template) {
    $form = Form::factory()->create([
        'is_auto_delete_enabled' => true,
        'data_retention_days' => 30,
    ]);

    $form->applyTemplate($template);

    $session = FormSession::factory()->create(['form_id' => $form->id]);

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [
            ...$form->formBlocks[0]->getSubmitPayload('tester@example.com'),
            ...$form->formBlocks[2]->getSubmitPayload([0]),
            ...$form->formBlocks[3]->getSubmitPayload([0, 1]),
        ],
    ])->assertStatus(200);

    // Assertions after submission
    $this->assertCount(4, FormSessionResponse::all());

    $this->travel(31)->days();
    $this->artisan('input:auto-delete-submissions');

    $this->assertNull($session->fresh());

    $this->assertCount(0, FormSessionResponse::all());
})->with('templates');

it('should not delete submissions when auto delete is not enabled', function ($template) {
    $form = Form::factory()->create([
        'is_auto_delete_enabled' => false,
        'data_retention_days' => 30,
    ]);

    $form->applyTemplate($template);

    $session = FormSession::factory()->create(['form_id' => $form->id]);

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [
            ...$form->formBlocks[0]->getSubmitPayload('tester@example.com'),
            ...$form->formBlocks[2]->getSubmitPayload([0]),
            ...$form->formBlocks[3]->getSubmitPayload([0, 1]),
        ],
    ])->assertStatus(200);

    // Assertions after submission
    $this->assertCount(4, FormSessionResponse::all());

    $this->travel(31)->days();
    $this->artisan('input:auto-delete-submissions');

    $this->assertNotNull($session->fresh());

    $this->assertCount(4, FormSessionResponse::all());
})->with('templates');
