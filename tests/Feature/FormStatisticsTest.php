<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

function countLoadedAnswers(): object
{
    $loaded = (object) ['count' => 0];

    foreach ([FormSession::class, FormSessionResponse::class] as $model) {
        Event::listen("eloquent.retrieved: {$model}", fn () => $loaded->count++);
    }

    return $loaded;
}

test('form json counts its sessions in sql', function () {
    $form = Form::factory()->create();
    $block = FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory()->input())
        ->create(['type' => FormBlockType::short]);

    $submitted = FormSession::factory()->for($form)->completed()->create();
    $started = FormSession::factory()->for($form)->create();
    FormSession::factory()->for($form)->completed()->create();
    FormSession::factory()->for($form)->create();

    foreach ([$submitted, $started] as $session) {
        FormSessionResponse::factory()->create([
            'form_session_id' => $session->id,
            'form_block_id' => $block->id,
            'form_block_interaction_id' => $block->formBlockInteractions[0]->id,
        ]);
    }

    $loaded = countLoadedAnswers();

    $this->actingAs($form->user)
        ->getJson(route('api.forms.show', $form))
        ->assertOk()
        ->assertJsonPath('total_sessions', 4)
        ->assertJsonPath('completed_sessions', 2)
        ->assertJsonPath('completion_rate', 50);

    expect($loaded->count)->toBe(0);
});

test('form json has a completion rate of 0 without sessions', function () {
    $form = Form::factory()->create();

    $this->actingAs($form->user)
        ->getJson(route('api.forms.show', $form))
        ->assertJsonPath('total_sessions', 0)
        ->assertJsonPath('completed_sessions', 0)
        ->assertJsonPath('completion_rate', 0);
});

test('a submit without answers counts like on the submissions page', function () {
    $user = User::factory()->withTeam()->create();
    $form = Form::factory()->create(['user_id' => $user->id, 'team_id' => $user->current_team_id]);

    // every question skipped
    $token = $this->postJson(route('api.public.forms.session.create', $form))->json('token');
    $this->postJson(route('api.public.forms.submit', $form), ['token' => $token, 'payload' => []])->assertOk();

    $this->actingAs($user)
        ->getJson(route('api.forms.index'))
        ->assertJsonPath('0.completed_sessions', 1)
        ->assertJsonPath('0.completion_rate', 100)
        ->assertJsonPath('0.latest_submission_at', fn ($date) => $date !== null);

    $this->actingAs($user)
        ->getJson(route('api.forms.submissions', $form))
        ->assertJsonPath('meta.total', 1);
});

test('blocks with submissions count the answers in sql', function () {
    $form = Form::factory()->create();
    $block = FormBlock::factory()->for($form)
        ->has(FormBlockInteraction::factory()->button()->count(2))
        ->create(['type' => FormBlockType::radio]);

    FormSessionResponse::factory()->count(3)->create([
        'form_block_id' => $block->id,
        'form_block_interaction_id' => $block->formBlockInteractions[0]->id,
    ]);

    $loaded = countLoadedAnswers();

    $this->actingAs($form->user)
        ->getJson(route('api.blocks.index', $form).'?includeSubmissions=true')
        ->assertOk()
        ->assertJsonPath('0.session_count', 3)
        ->assertJsonPath('0.interactions.0.responses_count', 3)
        ->assertJsonPath('0.interactions.1.responses_count', 0);

    expect($loaded->count)->toBe(0);
});

test('session lookups have indexes', function () {
    expect(Schema::hasIndex('form_sessions', ['form_id', 'token']))->toBeTrue()
        ->and(Schema::hasIndex('form_session_responses', ['form_session_id', 'form_block_id', 'form_block_interaction_id']))->toBeTrue()
        ->and(Schema::hasIndex('form_session_uploads', ['form_session_response_id']))->toBeTrue();
});
