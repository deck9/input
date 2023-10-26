<?php

use App\Models\Form;
use App\Models\FormWebhook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can_get_a_list_of_all_webhooks_of_a_form', function () {
    $this->withoutExceptionHandling();
    $form = Form::factory()->create();

    FormWebhook::factory()->count(3)->create([
        'form_id' => $form->id,
    ]);

    $response = $this->actingAs($form->user)->json('GET', route('api.forms.webhooks.index', $form))
        ->assertSuccessful();

    $this->assertCount(3, $response->json());
});

test('can_create_a_new_webhook_for_form', function () {
    $form = Form::factory()->create();

    $this->assertCount(0, $form->formWebhooks);

    $response = $this->actingAs($form->user)->json('POST', route('api.forms.webhooks.create', $form), [
        'name' => 'Test Integration',
        'webhook_url' => 'https://example.com/webhook',
        'webhook_method' => 'GET',
        'headers' => [
            'x-example' => 'test',
        ],
    ])->assertSuccessful();

    $this->assertNotNull($response->json('id'));
    $this->assertEquals('test', $response->json('headers.x-example'));

    $this->assertCount(1, $form->fresh()->formWebhooks);

    // assert that other user cannot create webhook for form
    $this->actingAs(User::factory()->create())
        ->json('POST', route('api.forms.webhooks.create', $form), [
            'name' => 'Test Integration',
            'webhook_url' => 'https://example.com/webhook',
            'webhook_method' => 'GET',
        ])
        ->assertStatus(403);
});

test('can_update_a_created_webhook', function () {
    $webhook = FormWebhook::factory()->create();

    $response = $this->actingAs($webhook->form->user)->json('POST', route('api.forms.webhooks.update', [$webhook->form, $webhook]), [
        'name' => 'Test Integration',
        'webhook_url' => 'https://example.com/webhook',
        'webhook_method' => 'GET',
        'headers' => [
            'x-example' => 'test',
        ],
    ])->assertSuccessful();

    $response->assertJson([
        'name' => 'Test Integration',
        'webhook_url' => 'https://example.com/webhook',
        'webhook_method' => 'GET',
        'headers' => [
            'x-example' => 'test',
        ],
    ]);
});

test('can_delete_a_form_webhook', function () {
    $webhook = FormWebhook::factory()->create();

    $this->assertCount(1, $webhook->form->formWebhooks);

    $this->actingAs($webhook->form->user)->json('DELETE', route('api.forms.webhooks.delete', [$webhook->form, $webhook]))
        ->assertSuccessful();

    $this->assertCount(0, $webhook->form->fresh()->formWebhooks);
});
