<?php

use App\Enums\FormBlockType;
use App\Models\FormBlock;
use App\Models\FormBlockLogic;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can create a rule for a form block', function () {
    $firstBlock = FormBlock::factory()->create();
    $block = FormBlock::factory()->for($firstBlock->form)->create();

    $response = $this->actingAs($block->form->user)
        ->json('post', route('api.logics.create', $block->id), [
            'name' => 'Test Rule',
            'conditions' => [
                [
                    'source' => $firstBlock->uuid,
                    'operator' => 'equals',
                    'value' => 'test',
                    'chainOperator' => 'and',
                ]
            ],
            'action' => 'hide',
            'evaluate' => 'before',
        ]);

    $response->assertStatus(201);
});

test('can update an existing form block logic', function () {
    $logic = FormBlockLogic::factory()->create();
    $block = FormBlock::factory()->for($logic->formBlock->form)->create();

    $this->actingAs($logic->formBlock->form->user)
        ->json('post', route('api.logics.update', $logic->id), [
            'name' => 'Test Rule',
            'conditions' => [
                [
                    'source' => $block->uuid,
                    'operator' => 'equals',
                    'value' => 'test',
                    'chainOperator' => 'and',
                ]
            ],
            'action' => 'hide',
            'evaluate' => 'before',
        ])->assertStatus(200);

    $logic->refresh();

    $this->assertEquals('Test Rule', $logic->name);
    $this->assertEquals('hide', $logic->action);
    $this->assertEquals('before', $logic->evaluate);
    $this->assertCount(1, $logic->conditions);
    $this->assertEquals($block->uuid, $logic->conditions[0]['source']);
});


test('can delete a logic rule', function () {
    $logic = FormBlockLogic::factory()->create();

    $this->actingAs($logic->formBlock->form->user)
        ->json('DELETE', route('api.logics.delete', $logic->id))
        ->assertStatus(200);

    $this->assertNull($logic->fresh());
});

test('a rule on a group can only use questions outside that group', function (string $method) {
    $outside = FormBlock::factory()->create();
    $group = FormBlock::factory()->for($outside->form)->create(['type' => FormBlockType::group]);
    $inside = FormBlock::factory()->for($outside->form)->create(['parent_block' => $group->uuid]);
    $logic = FormBlockLogic::factory()->for($group)->create(['name' => 'Old']);

    $route = $method === 'create' ? route('api.logics.create', $group->id) : route('api.logics.update', $logic->id);
    $rule = fn (FormBlock $source) => [
        'name' => 'New',
        'conditions' => [['source' => $source->uuid, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']],
        'action' => 'hide',
        'evaluate' => 'before',
    ];

    $this->actingAs($group->form->user)
        ->json('post', $route, $rule($inside))
        ->assertStatus(422)
        ->assertJsonValidationErrors('conditions.0.source');

    expect($group->formBlockLogics()->pluck('name')->all())->toBe(['Old']);

    $this->json('post', $route, $rule($outside))->assertSuccessful();
})->with(['create', 'update']);

test('a block or rule id that is not a whole number is not found and changes nothing', function (string $suffix) {
    $logic = FormBlockLogic::factory()->create(['name' => 'Old']);
    $block = $logic->formBlock;
    $source = FormBlock::factory()->for($block->form)->create();
    $rule = [
        'name' => 'New',
        'conditions' => [['source' => $source->uuid, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']],
        'action' => 'hide',
        'evaluate' => 'before',
    ];

    $this->actingAs($block->form->user);
    $this->json('post', route('api.logics.create', $block->id.$suffix), $rule)->assertNotFound();
    $this->json('post', route('api.logics.update', $logic->id.$suffix), $rule)->assertNotFound();
    $this->json('DELETE', route('api.logics.delete', $logic->id.$suffix))->assertNotFound();

    expect(FormBlockLogic::pluck('name', 'id')->all())->toBe([$logic->id => 'Old']);
})->with(['xlf', '.0', 'e0']);

test('a rule with empty fields gets errors in the editor\'s words', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('post', route('api.logics.create', $block->id), ['conditions' => [[]]])
        ->assertStatus(422)
        ->assertJsonValidationErrors([
            'name' => 'Give the rule a name.',
            'conditions.0.source' => 'Pick a question for condition 1.',
            'conditions.0.value' => 'Add an answer for condition 1.',
            'conditions.0.operator' => 'Pick how to compare in condition 1.',
            'conditions.0.chainOperator' => 'Pick "and" or "or" for condition 1.',
            'action' => 'Pick what the rule does: hide, show or go to.',
            'evaluate' => 'Pick when the rule runs: before or after the question.',
        ]);

    $this->json('post', route('api.logics.create', $block->id), [])
        ->assertJsonValidationErrors(['conditions' => 'Add at least one condition.']);
});

test('a rule that points to a deleted question or one of another form is refused and changes nothing', function (string $method, string $field) {
    $block = FormBlock::factory()->create();
    $question = FormBlock::factory()->for($block->form)->create();
    $logic = FormBlockLogic::factory()->for($block)->create(['name' => 'Old']);
    $deleted = FormBlock::factory()->for($block->form)->create();
    $deleted->delete();
    $otherForm = FormBlock::factory()->create();

    $route = $method === 'create' ? route('api.logics.create', $block->id) : route('api.logics.update', $logic->id);
    $rule = fn (string $source, string $target) => [
        'name' => 'New',
        'conditions' => [['source' => $source, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']],
        'action' => 'goto',
        'action_payload' => $target,
        'evaluate' => 'after',
    ];

    $this->actingAs($block->form->user);

    foreach ([$deleted->uuid, $otherForm->uuid] as $missing) {
        $payload = $field === 'action_payload' ? $rule($question->uuid, $missing) : $rule($missing, $question->uuid);

        $this->json('post', $route, $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors([$field => 'is not in this form'])
            ->assertJsonMissingValidationErrors($field === 'action_payload' ? 'conditions.0.source' : 'action_payload');
    }

    expect(FormBlockLogic::pluck('name')->all())->toBe(['Old']);

    $this->json('post', $route, $rule($question->uuid, $question->uuid))->assertSuccessful();
})->with(['create', 'update'])->with(['conditions.0.source', 'action_payload']);

test('a hide or show rule that kept an old target from a deleted question saves as before', function (string $method, string $action) {
    $block = FormBlock::factory()->create();
    $question = FormBlock::factory()->for($block->form)->create();
    $logic = FormBlockLogic::factory()->for($block)->create(['name' => 'Old']);
    $deleted = FormBlock::factory()->for($block->form)->create();
    $deleted->delete();

    // the editor keeps the old target when a rule switches from goto to hide or show
    $this->actingAs($block->form->user)
        ->json('post', $method === 'create' ? route('api.logics.create', $block->id) : route('api.logics.update', $logic->id), [
            'name' => 'New',
            'conditions' => [['source' => $question->uuid, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and']],
            'action' => $action,
            'action_payload' => $deleted->uuid,
            'evaluate' => 'before',
        ])
        ->assertSuccessful();

    expect(FormBlockLogic::where('name', 'New')->value('action'))->toBe($action);
})->with(['create', 'update'])->with(['hide', 'show']);
