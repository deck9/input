<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormBlockLogic;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;

uses(RefreshDatabase::class);

test('can export a form as a string', function () {
    $form = Form::factory()
        ->has(
            FormBlock::factory(['type' => FormBlockType::short])
                ->has(FormBlockInteraction::factory())
        )
        ->create([
            'name' => 'Test Form',
            'description' => 'A template Export Test',
            'brand_color' => '#487596',
        ]);

    $response = $this->actingAs($form->user)
        ->json('GET', route('api.forms.template-export', [
            'form' => $form->uuid,
        ]))->assertStatus(200);

    $response->assertJsonFragment([
        'description' => 'A template Export Test',
        'brand_color' => '#487596',
    ]);

    $this->assertNotNull($response->json('blocks.0.formBlockInteractions'));
});

test('can export a form as a json file', function () {
    $form = Form::factory()
        ->has(
            FormBlock::factory(['type' => FormBlockType::short])
                ->has(FormBlockInteraction::factory())
        )
        ->create([
            'name' => 'Test Form',
            'description' => 'A template Export Test',
            'brand_color' => '#487596',
        ]);

    $response = $this->actingAs($form->user)
        ->get(route('forms.template-download', [
            'form' => $form->uuid,
        ]))
        ->assertOk()
        ->assertDownload('test-form.template.json');

    $contents = json_decode($response->streamedContent(), true);
    $action = Arr::get($contents, 'blocks.0.formBlockInteractions');
    $this->assertNotNull($action);
});

test('group blocks have an Id attribute and children have a parent Id', function () {
    $form = Form::factory()
        ->create([
            'name' => 'Test Form',
        ]);

    $groupBlock = FormBlock::factory()->create([
        'form_id' => $form->id,
        'type' => FormBlockType::group,
    ]);

    FormBlock::factory()->create([
        'form_id' => $form->id,
        'type' => FormBlockType::none,
        'parent_block' => $groupBlock->uuid,
    ]);

    $response = $this->actingAs($form->user)
        ->json('GET', route('api.forms.template-export', [
            'form' => $form->uuid,
        ]))->assertStatus(200);

    // assert that the group block has an id
    $this->assertArrayHasKey('id', $response->json('blocks.0'));

    // assert that the child block has a parent id
    $this->assertArrayHasKey('parent_block', $response->json('blocks.1'));
});

test('can import a form that has a group block with a child block', function () {
    $form = Form::factory()
        ->create([
            'name' => 'Test Form',
        ]);

    $groupBlock = FormBlock::factory()->create([
        'form_id' => $form->id,
        'type' => FormBlockType::group,
    ]);

    FormBlock::factory()->create([
        'form_id' => $form->id,
        'type' => FormBlockType::none,
        'parent_block' => $groupBlock->uuid,
    ]);

    $importTemplateString = $this->actingAs($form->user)
        ->json('GET', route('api.forms.template-export', [
            'form' => $form->uuid,
        ]))->assertStatus(200)->content();


    // create a new form to import the template
    $user = User::factory()->withTeam()->create();

    $newForm = Form::factory()->create([
        'name' => 'Test Form',
        'description' => 'A template Import Test',
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    // import the template
    $this->actingAs($user)->post(route('api.forms.template-import', [
        'form' => $newForm->uuid,
    ]), [
        'template' => $importTemplateString,
    ])->assertStatus(200);

    $this->assertFalse($newForm->formBlocks[0]->uuid === $groupBlock->uuid);
    $this->assertNull($newForm->formBlocks[0]->parent_block);
    $this->assertNotNull($newForm->formBlocks[1]->parent_block);

    // assert that the children reference the correct parent block
    $this->assertEquals($newForm->formBlocks[1]->parent_block, $newForm->formBlocks[0]->uuid);
});

test('can import a string template for an existing form', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();

    $form = Form::factory()->create([
        'name' => 'Test Form',
        'description' => 'A template Import Test',
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    $importTemplateString = file_get_contents(base_path('tests/form.template.json'));

    $response = $this->actingAs($user)->post(route('api.forms.template-import', [
        'form' => $form->uuid,
    ]), [
        'template' => $importTemplateString,
    ])->assertStatus(200);

    $this->assertNotNull($response->json('message'));

    $form->refresh();

    $this->assertEquals('This is just a test', $form->description);
    $this->assertEquals($user->id, $form->user_id);
    $this->assertCount(4, $form->formBlocks);

    $this->assertCount(1, $form->formBlocks[1]->formBlockInteractions);
    $this->assertEquals(FormBlockType::short, $form->formBlocks[1]->type);

    $this->assertCount(2, $form->formBlocks[2]->formBlockInteractions);
    $this->assertEquals(FormBlockType::radio, $form->formBlocks[2]->type);
});

test('can import a file template for an existing form', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();

    $form = Form::factory()->create([
        'name' => 'Test Form',
        'description' => 'A template Import Test',
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    $templateFile = UploadedFile::fake()->createWithContent(
        'form.template.json',
        file_get_contents(base_path('tests/form.template.json'))
    );

    $response = $this->actingAs($user)->post(route('api.forms.template-import', [
        'form' => $form->uuid,
    ]), [
        'file' => $templateFile,
    ])->assertOk();

    $this->assertNotNull($response->json('message'));

    $form->refresh();

    $this->assertEquals('This is just a test', $form->description);
    $this->assertEquals($user->id, $form->user_id);
    $this->assertCount(4, $form->formBlocks);

    $this->assertCount(1, $form->formBlocks[1]->formBlockInteractions);
    $this->assertEquals(FormBlockType::short, $form->formBlocks[1]->type);

    $this->assertCount(2, $form->formBlocks[2]->formBlockInteractions);
    $this->assertEquals(FormBlockType::radio, $form->formBlocks[2]->type);
});

test('template import keeps the form\'s own image paths', function () {
    $user = User::factory()->withTeam()->create();

    $form = Form::factory()->create([
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);
    $form->update(['avatar_path' => $form->uuid.'/avatar.png']);

    $this->actingAs($user)->post(route('api.forms.template-import', [
        'form' => $form->uuid,
    ]), [
        'template' => json_encode([
            'description' => 'Imported',
            'avatar_path' => 'another-form/avatar.png',
            'background_path' => 'another-form/background.png',
            'blocks' => [],
        ]),
    ])->assertStatus(200);

    $form->refresh();

    $this->assertEquals('Imported', $form->description);
    $this->assertEquals($form->uuid.'/avatar.png', $form->avatar_path);
    $this->assertNull($form->background_path);
});

test('template import only accepts http(s) and mailto links', function (string $key) {
    $form = Form::factory()->create();
    $import = fn (string $link) => $this->actingAs($form->user)->postJson(route('api.forms.template-import', [
        'form' => $form->uuid,
    ]), [
        'template' => json_encode([$key => $link, 'blocks' => []]),
    ]);

    $import('javascript:alert(1)')
        ->assertStatus(422)
        ->assertJsonValidationErrors($key);

    expect($form->fresh()->$key)->not->toBe('javascript:alert(1)');

    $import('mailto:team@example.com')->assertOk();

    expect($form->fresh()->$key)->toBe('mailto:team@example.com');
})->with(['cta_link', 'privacy_link', 'legal_notice_link', 'twitter', 'facebook', 'instagram', 'github', 'linkedin']);

test('export, then import into another form keeps the logic rules and their targets', function () {
    $form = Form::factory()->create();
    $question = FormBlock::factory()->create(['form_id' => $form->id, 'type' => FormBlockType::short, 'sequence' => 0]);
    $target = FormBlock::factory()->create(['form_id' => $form->id, 'sequence' => 1]);

    FormBlockLogic::factory()->create([
        'form_block_id' => $question->id,
        'name' => 'Jump on yes',
        'action' => 'goto',
        'action_payload' => $target->uuid,
        'evaluate' => 'after',
        'conditions' => [['source' => $question->uuid, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']],
    ]);

    $template = $this->actingAs($form->user)
        ->json('GET', route('api.forms.template-export', ['form' => $form->uuid]))
        ->assertOk()
        ->content();

    $newForm = Form::factory()->create();

    $this->actingAs($newForm->user)->post(route('api.forms.template-import', ['form' => $newForm->uuid]), [
        'template' => $template,
    ])->assertOk();

    [$newQuestion, $newTarget] = $newForm->fresh()->formBlocks->all();
    $logic = $newQuestion->formBlockLogics->sole();

    expect($logic->only('name', 'action', 'evaluate'))->toBe(['name' => 'Jump on yes', 'action' => 'goto', 'evaluate' => 'after'])
        ->and($logic->action_payload)->toBe($newTarget->uuid)
        ->and($logic->conditions)->toBe([['source' => $newQuestion->uuid, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']]);
});

test('template import drops a logic rule that points to a block missing from the template', function () {
    $form = Form::factory()->create();
    $conditions = fn (string $source) => [['source' => $source, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']];

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['blocks' => [
            ['id' => 'a', 'type' => 'input-short', 'message' => 'Question', 'sequence' => 0, 'formBlockLogics' => [
                ['name' => 'Kept', 'action' => 'goto', 'action_payload' => 'b', 'evaluate' => 'after', 'conditions' => $conditions('a')],
                ['name' => 'Missing source', 'action' => 'hide', 'evaluate' => 'before', 'conditions' => $conditions('gone')],
                ['name' => 'Missing target', 'action' => 'goto', 'action_payload' => 'gone', 'evaluate' => 'after', 'conditions' => $conditions('a')],
            ]],
            ['id' => 'b', 'type' => 'none', 'message' => 'End', 'sequence' => 1],
        ]]),
    ])->assertOk();

    expect($form->fresh()->formBlocks[0]->formBlockLogics->pluck('name')->all())->toBe(['Kept']);
});

test('a template made before logic rules were exported still imports', function () {
    $form = Form::factory()->create();

    $this->actingAs($form->user)->post(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => file_get_contents(base_path('tests/form.template.json')),
    ])->assertOk();

    $blocks = $form->fresh()->formBlocks;

    expect($blocks)->toHaveCount(4)
        ->and($blocks->flatMap->formBlockLogics)->toBeEmpty();
});

test('template import rejects a malformed logic rule before it changes the form', function () {
    $form = Form::factory()->has(FormBlock::factory())->create();

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['blocks' => [
            ['id' => 'a', 'type' => 'none', 'message' => 'Hi', 'sequence' => 0, 'formBlockLogics' => [
                ['name' => 'No conditions', 'action' => 'hide', 'evaluate' => 'before'],
            ]],
        ]]),
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('blocks.0.formBlockLogics.0.conditions');

    expect($form->fresh()->formBlocks)->toHaveCount(1);
});

test('template import is refused for a form with answers and deletes none', function () {
    $form = Form::factory()->create(['description' => 'Original']);
    $block = FormBlock::factory()->for($form)->create(['type' => FormBlockType::short]);
    $interaction = FormBlockInteraction::factory()->for($block)->create();
    $block->submit(FormSession::factory()->for($form)->create(), ['actionId' => $interaction->uuid, 'payload' => 'yes']);

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => file_get_contents(base_path('tests/form.template.json')),
    ])->assertStatus(422);

    expect(FormSessionResponse::count())->toBe(1)
        ->and($form->fresh()->formBlocks->pluck('id')->all())->toBe([$block->id])
        ->and($form->fresh()->description)->toBe('Original');
});

test('template import rejects a template without blocks or with an unknown question type and keeps the form', function (array $template, string $error) {
    $form = Form::factory()->has(FormBlock::factory())->create(['description' => 'Original']);

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['description' => 'Imported', ...$template]),
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors($error);

    expect($form->fresh()->formBlocks)->toHaveCount(1)
        ->and($form->fresh()->description)->toBe('Original');
})->with([
    'no blocks' => [[], 'blocks'],
    'unknown question type' => [['blocks' => [['type' => 'input-magic', 'message' => 'Hi', 'sequence' => 0]]], 'blocks.0.type'],
]);

test('template import rejects a block id that is not text before it changes the form', function ($id) {
    $form = Form::factory()->has(FormBlock::factory())->create();

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['blocks' => [['id' => $id, 'type' => 'none', 'message' => 'Hi', 'sequence' => 0]]]),
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('blocks.0.id');

    expect($form->fresh()->formBlocks)->toHaveCount(1);
})->with([
    'a number' => [5],
    'a list' => [['a']],
]);

test('template import rejects auto delete with a retention period below one day', function (array $form, array $template) {
    $form = Form::factory()->create($form);

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode([...$template, 'data_retention_days' => 0, 'blocks' => []]),
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('data_retention_days');

    expect($form->fresh()->data_retention_days)->not->toBe(0);
})->with([
    'auto delete on in the template' => [[], ['is_auto_delete_enabled' => true]],
    'auto delete already on in the form' => [['is_auto_delete_enabled' => true, 'data_retention_days' => 30], []],
]);

test('a template import that fails halfway leaves the form unchanged', function () {
    $form = Form::factory()->has(FormBlock::factory())->create(['description' => 'Original']);

    // any error after the old blocks are gone
    FormBlock::created(fn () => throw new RuntimeException('disk full'));

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['description' => 'Imported', 'blocks' => [['type' => 'none', 'message' => 'Hi', 'sequence' => 0]]]),
    ])->assertServerError();

    expect($form->fresh()->formBlocks)->toHaveCount(1)
        ->and($form->fresh()->description)->toBe('Original');
});

test('template import treats a block without parent_block as a top-level block', function () {
    $form = Form::factory()->create();

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['blocks' => [
            ['id' => 'g', 'type' => 'group', 'message' => 'Group', 'sequence' => 0],
            ['id' => 'c', 'type' => 'none', 'message' => 'Child', 'parent_block' => 'g', 'sequence' => 1],
            ['id' => 'q', 'type' => 'input-short', 'message' => 'Question', 'sequence' => 2],
        ]]),
    ])->assertOk();

    [$group, $child, $question] = $form->fresh()->formBlocks->all();

    expect([$group->message, $child->message, $question->message])->toBe(['Group', 'Child', 'Question'])
        ->and($child->parent_block)->toBe($group->uuid)
        ->and($question->parent_block)->toBeNull();
});

test('template import removes the form\'s old logic rules with its blocks', function () {
    $form = Form::factory()->create();
    FormBlockLogic::factory()->for(FormBlock::factory()->for($form))->create();

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['blocks' => []]),
    ])->assertOk();

    expect(FormBlockLogic::count())->toBe(0);
});

test('template import requires update on the form', function () {
    $form = Form::factory()->create();

    // a user who may view the form but not change it
    Gate::before(fn ($user, string $ability) => $ability === 'update' ? false : null);

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['description' => 'Imported', 'blocks' => []]),
    ])->assertForbidden();

    expect($form->fresh()->description)->not->toBe('Imported');
});

test('creates a form from a template file in the user\'s current team', function () {
    $user = User::factory()->withTeam()->create();

    $response = $this->actingAs($user)->post(route('api.forms.create-from-template'), [
        'file' => UploadedFile::fake()->createWithContent('form.template.json', file_get_contents(base_path('tests/form.template.json'))),
    ])->assertCreated();

    $form = Form::where('uuid', $response->json('uuid'))->firstOrFail();

    expect($form->team_id)->toBe($user->current_team_id)
        ->and($form->user_id)->toBe($user->id)
        ->and($form->name)->toBe('Untitled Form')
        ->and($form->description)->toBe('This is just a test')
        ->and($form->formBlocks)->toHaveCount(4);
});

test('a refused template creates no form', function (array $data, string $error) {
    $user = User::factory()->withTeam()->create();

    $this->actingAs($user)->postJson(route('api.forms.create-from-template'), $data)
        ->assertStatus(422)
        ->assertJsonValidationErrors($error);

    expect(Form::count())->toBe(0);
})->with([
    'no file' => [[], 'file'],
    'not a json file' => [fn () => ['file' => UploadedFile::fake()->createWithContent('form.txt', 'hello')], 'file'],
    'no blocks' => [['template' => json_encode(['description' => 'Imported'])], 'blocks'],
    'unknown question type' => [['template' => json_encode(['blocks' => [['type' => 'input-magic', 'message' => 'Hi', 'sequence' => 0]]])], 'blocks.0.type'],
    'a link that is not http(s)' => [['template' => json_encode(['blocks' => [], 'cta_link' => 'javascript:alert(1)'])], 'cta_link'],
    'auto delete below one day' => [['template' => json_encode(['blocks' => [], 'is_auto_delete_enabled' => true, 'data_retention_days' => 0])], 'data_retention_days'],
    'a group inside a group' => [['template' => json_encode(['blocks' => [
        ['id' => 'g', 'type' => 'group', 'message' => 'Outer', 'sequence' => 0],
        ['id' => 'h', 'type' => 'group', 'message' => 'Inner', 'sequence' => 1, 'parent_block' => 'g'],
    ]])], 'blocks.1.parent_block'],
]);

test('a template that fails halfway creates no form', function () {
    $user = User::factory()->withTeam()->create();

    FormBlock::created(fn () => throw new RuntimeException('disk full'));

    $this->actingAs($user)->postJson(route('api.forms.create-from-template'), [
        'template' => json_encode(['blocks' => [['type' => 'none', 'message' => 'Hi', 'sequence' => 0]]]),
    ])->assertServerError();

    expect(Form::count())->toBe(0);
});

test('creating a form from a template needs a logged-in user', function () {
    $this->postJson(route('api.forms.create-from-template'), [
        'template' => json_encode(['blocks' => []]),
    ])->assertUnauthorized();

    expect(Form::count())->toBe(0);
});

test('a form from a template takes the given name', function () {
    $user = User::factory()->withTeam()->create();

    $response = $this->actingAs($user)->postJson(route('api.forms.create-from-template'), [
        'name' => 'Contact',
        'template' => json_encode(['blocks' => []]),
    ])->assertCreated();

    expect($response->json('name'))->toBe('Contact');
});

test('a form from a template refuses a name over 255 characters', function () {
    $user = User::factory()->withTeam()->create();

    $this->actingAs($user)->postJson(route('api.forms.create-from-template'), [
        'name' => str_repeat('a', 256),
        'template' => json_encode(['blocks' => []]),
    ])->assertStatus(422)->assertJsonValidationErrors('name');

    expect(Form::count())->toBe(0);
});

test('template import rejects a rule on a group that uses a question inside that group', function () {
    $form = Form::factory()->has(FormBlock::factory())->create();
    $template = fn (string $source) => json_encode(['blocks' => [
        ['id' => 'q', 'type' => 'input-short', 'message' => 'Outside', 'sequence' => 0],
        ['id' => 'g', 'type' => 'group', 'message' => 'Group', 'sequence' => 1, 'formBlockLogics' => [
            ['name' => 'Hide group', 'action' => 'hide', 'evaluate' => 'before', 'conditions' => [
                ['source' => $source, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and'],
            ]],
        ]],
        ['id' => 'c', 'type' => 'input-short', 'message' => 'Inside', 'sequence' => 2, 'parent_block' => 'g'],
    ]]);

    $this->actingAs($form->user)
        ->postJson(route('api.forms.template-import', ['form' => $form->uuid]), ['template' => $template('c')])
        ->assertStatus(422)
        ->assertJsonValidationErrors('blocks.1.formBlockLogics.0.conditions.0.source');

    expect($form->fresh()->formBlocks)->toHaveCount(1);

    $this->postJson(route('api.forms.template-import', ['form' => $form->uuid]), ['template' => $template('q')])
        ->assertOk();

    expect($form->fresh()->formBlocks->firstWhere('type', FormBlockType::group)->formBlockLogics)->toHaveCount(1);
});

test('template import rejects a group inside a group and keeps the form', function () {
    $form = Form::factory()->has(FormBlock::factory())->create();

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['blocks' => [
            ['id' => 'g', 'type' => 'group', 'message' => 'Outer', 'sequence' => 0],
            ['id' => 'h', 'type' => 'group', 'message' => 'Inner', 'sequence' => 1, 'parent_block' => 'g'],
            ['id' => 'c', 'type' => 'input-short', 'message' => 'Lost', 'sequence' => 2, 'parent_block' => 'h'],
        ]]),
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['blocks.1.parent_block' => 'A group can\'t go into another group.']);

    expect($form->fresh()->formBlocks)->toHaveCount(1);
});

test('template import rejects a parent_block that is not a top-level group of the template and keeps the form', function (string $type, string $parent) {
    $form = Form::factory()->has(FormBlock::factory())->create();

    $this->actingAs($form->user)->postJson(route('api.forms.template-import', ['form' => $form->uuid]), [
        'template' => json_encode(['blocks' => [
            ['id' => 'q', 'type' => 'input-short', 'message' => 'Question', 'sequence' => 0],
            ['id' => 'g', 'type' => 'group', 'message' => 'Group', 'sequence' => 1],
            ['id' => 'c', 'type' => $type, 'message' => 'Lost', 'sequence' => 2, 'parent_block' => $parent],
        ]]),
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('blocks.2.parent_block');

    expect($form->fresh()->formBlocks)->toHaveCount(1);
})->with([
    'a question' => ['input-short', 'q'],
    'a missing block' => ['input-short', 'gone'],
    'an empty id' => ['input-short', ''],
    'a group with an empty id' => ['group', ''],
]);
