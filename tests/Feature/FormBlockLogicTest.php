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
            'conditions.0.value' => 'Enter a value for condition 1.',
            'conditions.0.operator' => 'Pick how to compare in condition 1.',
            'conditions.0.chainOperator' => 'Pick "and" or "or" for condition 1.',
            'action' => 'Pick what the rule does: hide, show or go to.',
            'evaluate' => 'Pick when the rule runs: before or after the question.',
        ]);

    $this->json('post', route('api.logics.create', $block->id), [])
        ->assertJsonValidationErrors(['conditions' => 'Add at least one condition.']);
});
