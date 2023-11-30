<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can purge all results for a form', function () {
    $form = Form::factory()->create();

    FormSession::factory()
        ->completed()
        ->times(5)
        ->for($form)
        ->create();

    $this->actingAs($form->user)
        ->json('post', route('api.forms.purge-results', ['form' => $form->uuid]));

    $this->assertCount(0, $form->fresh()->formSessions);
});

test('can delete a single form submission', function () {
    $form = Form::factory()->create();

    FormSession::factory()
        ->times(2)
        ->completed()
        ->for($form)
        ->create();

    $session = FormSession::factory()
        ->completed()
        ->for($form)
        ->create();

    $this->assertCount(3, $form->fresh()->formSessions);

    $this->actingAs($form->user)
        ->json('delete', route('api.forms.submissions.delete', ['form' => $form->uuid, 'session' => $session->id]))
        ->assertSuccessful();

    $this->assertCount(2, $form->fresh()->formSessions);
});

test('can get all submissions for a form via api', function () {
    $form = Form::factory()->create();

    FormBlock::factory()
        ->input(FormBlockType::short)
        ->times(2)
        ->for($form)
        ->create();

    FormSession::factory()
        ->completed()
        ->has(FormSessionResponse::factory()->count(2))
        ->for($form)
        ->create();

    FormSession::factory()
        ->completed()
        ->has(FormSessionResponse::factory()->count(1))
        ->for($form)
        ->create();

    FormSession::factory()
        ->completed()
        ->for($form)
        ->create();

    FormSession::factory()
        ->for($form)
        ->create();

    $response = $this->actingAs($form->user)
        ->json('get', route('api.forms.submissions', ['form' => $form->uuid]))
        ->assertStatus(200);

    // assert that count of total session data is 3
    $this->assertCount(3, $response->json('data'));

    // assert that each sessions has the submitted responses
    $this->assertCount(2, $response->json('data.0.responses'));
    $this->assertCount(1, $response->json('data.1.responses'));
    $this->assertCount(0, $response->json('data.2.responses'));
});

test('returned submission has responses keyed by form block uuid', function () {
    $form = Form::factory()->create();

    $block = FormBlock::factory()
        ->input(FormBlockType::short)
        ->for($form)
        ->create();

    FormSession::factory()
        ->completed()
        ->has(FormSessionResponse::factory()->for($block))
        ->for($form)
        ->create();

    $response = $this->actingAs($form->user)
        ->json('get', route('api.forms.submissions', ['form' => $form->uuid]))
        ->assertStatus(200);

    $this->assertArrayHasKey($block->uuid, $response->json('data.0.responses'));
});

test('submissions only viewable to authenticated owner of the form', function () {
    $form = Form::factory()->create();

    FormBlock::factory()
        ->input(FormBlockType::short)
        ->times(2)
        ->for($form)
        ->create();

    FormSession::factory()
        ->completed()
        ->has(FormSessionResponse::factory()->count(2))
        ->for($form)
        ->create();

    $this->json('get', route('api.forms.submissions', ['form' => $form->uuid]))
        ->assertStatus(401);

    $this->actingAs(User::factory()->create())
        ->json('get', route('api.forms.submissions', ['form' => $form->uuid]))
        ->assertStatus(404);
});

test('submissions response is a pagination response', function () {
    $form = Form::factory()->create();

    FormBlock::factory()
        ->input(FormBlockType::short)
        ->times(2)
        ->for($form)
        ->create();

    FormSession::factory()
        ->completed()
        ->has(FormSessionResponse::factory()->count(2))
        ->for($form)
        ->create();

    $response = $this->actingAs($form->user)
        ->json('get', route('api.forms.submissions', ['form' => $form->uuid]))
        ->assertStatus(200);

    // assert that response has pagination data
    $this->assertArrayHasKey('current_page', $response->json('meta'));
    $this->assertArrayHasKey('from', $response->json('meta'));
    $this->assertArrayHasKey('last_page', $response->json('meta'));
    $this->assertArrayHasKey('path', $response->json('meta'));
    $this->assertArrayHasKey('per_page', $response->json('meta'));
    $this->assertArrayHasKey('to', $response->json('meta'));
    $this->assertArrayHasKey('total', $response->json('meta'));
});
