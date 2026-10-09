<?php

use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormBlockLogic;
use App\Models\FormSession;
use App\Models\FormWebhook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function () {
    // team A owns a form with one of every child row
    $this->form = Form::factory()->create();
    $this->block = FormBlock::factory()->for($this->form)->create();
    $this->interaction = FormBlockInteraction::factory()->for($this->block)->create();
    $this->logic = FormBlockLogic::factory()->for($this->block)->create();
    $this->webhook = FormWebhook::factory()->for($this->form)->create();
    $this->session = FormSession::factory()->completed()->for($this->form)->create();

    // team B has its own form, so it passes checks on the form in the url
    $this->intruder = User::factory()->withTeam()->create();
    $this->intruderForm = Form::factory()->create([
        'user_id' => $this->intruder->id,
        'team_id' => $this->intruder->current_team_id,
    ]);

    // every row of team A as stored, plus row counts to catch new rows
    $this->snapshot = fn () => [
        collect([$this->form, $this->block, $this->interaction, $this->logic, $this->webhook, $this->session])
            ->map(fn ($model) => $model->fresh()?->getAttributes())
            ->all(),
        collect([Form::withTrashed(), FormBlock::query(), FormBlockInteraction::query(), FormBlockLogic::query(), FormWebhook::query(), FormSession::query()])
            ->map(fn ($query) => $query->count())
            ->all(),
    ];
});

$logicPayload = [
    'name' => 'Hijacked Rule',
    'conditions' => [
        ['source' => 'any', 'operator' => 'equals', 'value' => 'x', 'chainOperator' => 'and'],
    ],
    'action' => 'hide',
    'evaluate' => 'before',
];

$webhookPayload = [
    'name' => 'Hijacked Webhook',
    'webhook_url' => 'https://attacker.example.com/hook',
    'webhook_method' => 'POST',
];

test('a user from another team cannot read, change or delete team data', function (string $method, string $uri, array $payload, int $status) {
    $before = ($this->snapshot)();

    $this->actingAs($this->intruder)
        ->json($method, $uri, $payload)
        ->assertStatus($status);

    $this->assertEquals($before, ($this->snapshot)());
})->with([
    // forms
    'show form' => ['get', fn () => route('api.forms.show', $this->form), [], 403],
    'update form' => ['post', fn () => route('api.forms.update', $this->form), ['name' => 'Hijacked'], 403],
    'delete form' => ['delete', fn () => route('api.forms.delete', $this->form), [], 403],
    'force delete form' => ['delete', fn () => route('api.forms.trashed.delete', $this->form), [], 404],
    'restore form' => ['post', fn () => route('api.forms.trashed.restore', $this->form), [], 404],
    'duplicate form' => ['post', fn () => route('api.forms.duplicate', $this->form), [], 403],
    'publish form' => ['post', fn () => route('api.forms.publish', $this->form), [], 403],
    'unpublish form' => ['post', fn () => route('api.forms.unpublish', $this->form), [], 403],
    'upload form image' => ['post', fn () => route('api.forms.images.store', $this->form), ['image' => UploadedFile::fake()->image('avatar.jpeg'), 'type' => 'avatar'], 403],
    'delete form image' => ['delete', fn () => route('api.forms.images.delete', $this->form), ['type' => 'avatar'], 403],
    'export template' => ['get', fn () => route('api.forms.template-export', $this->form), [], 403],
    'import template' => ['post', fn () => route('api.forms.template-import', $this->form), ['template' => '{}'], 403],
    'edit page' => ['get', fn () => route('forms.edit', $this->form->uuid), [], 404],
    'settings page' => ['get', fn () => route('forms.settings', $this->form->uuid), [], 404],
    'submissions page' => ['get', fn () => route('forms.submissions', $this->form->uuid), [], 404],
    'integrations page' => ['get', fn () => route('forms.integrations', $this->form->uuid), [], 404],
    'download template' => ['get', fn () => route('forms.template-download', $this->form), [], 403],
    'export submissions' => ['get', fn () => route('forms.submissions-export', $this->form), [], 403],

    // blocks
    'list blocks' => ['get', fn () => route('api.blocks.index', $this->form), [], 403],
    'create block' => ['post', fn () => route('api.blocks.create', $this->form), [], 403],
    'update block' => ['post', fn () => route('api.blocks.update', $this->block), ['message' => 'Hijacked'], 403],
    'delete block' => ['delete', fn () => route('api.blocks.delete', $this->block), [], 403],
    'sort blocks' => ['post', fn () => route('api.blocks.sequence', $this->form), ['sequence' => []], 403],

    // interactions
    'create interaction' => ['post', fn () => route('api.interactions.create', $this->block), ['type' => 'button'], 403],
    'update interaction' => ['post', fn () => route('api.interactions.update', $this->interaction), ['label' => 'Hijacked'], 403],
    'delete interaction' => ['delete', fn () => route('api.interactions.delete', $this->interaction), [], 403],
    'sort interactions' => ['post', fn () => route('api.interactions.sequence', $this->block), ['sequence' => []], 403],

    // logic rules
    'create logic rule' => ['post', fn () => route('api.logics.create', $this->block), $logicPayload, 403],
    'update logic rule' => ['post', fn () => route('api.logics.update', $this->logic), $logicPayload, 403],
    'delete logic rule' => ['delete', fn () => route('api.logics.delete', $this->logic), [], 403],

    // webhooks
    'list webhooks' => ['get', fn () => route('api.forms.webhooks.index', $this->form), [], 403],
    'create webhook' => ['post', fn () => route('api.forms.webhooks.create', $this->form), $webhookPayload, 403],
    'update webhook' => ['post', fn () => route('api.forms.webhooks.update', [$this->form, $this->webhook]), $webhookPayload, 403],
    'delete webhook' => ['delete', fn () => route('api.forms.webhooks.delete', [$this->form, $this->webhook]), [], 403],
    'update webhook via own form' => ['post', fn () => route('api.forms.webhooks.update', [$this->intruderForm, $this->webhook]), $webhookPayload, 404],
    'update webhook via own form, invalid body' => ['post', fn () => route('api.forms.webhooks.update', [$this->intruderForm, $this->webhook]), [], 404],
    'delete webhook via own form' => ['delete', fn () => route('api.forms.webhooks.delete', [$this->intruderForm, $this->webhook]), [], 404],

    // submissions
    'list submissions' => ['get', fn () => route('api.forms.submissions', $this->form), [], 404],
    'delete submission' => ['delete', fn () => route('api.forms.submissions.delete', [$this->form, $this->session]), [], 403],
    'delete submission via own form' => ['delete', fn () => route('api.forms.submissions.delete', [$this->intruderForm, $this->session]), [], 404],
    'purge submissions' => ['post', fn () => route('api.forms.purge-results', $this->form), [], 403],
]);
