<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can_change_the_sequence_of_blocks', function () {
    $form = Form::factory()
        ->has(FormBlock::factory(['sequence' => 0]))
        ->has(FormBlock::factory(['sequence' => 1]))
        ->create();

    $this->assertEquals(0, $form->formBlocks[0]->sequence);
    $this->assertEquals(1, $form->formBlocks[1]->sequence);

    $this->actingAs($form->user)
        ->json('POST', route('api.blocks.sequence', ['form' => $form->uuid]), [
            'sequence' => [
                ['id' => $form->formBlocks[1]->id, 'scope' => null],
                ['id' => $form->formBlocks[0]->id, 'scope' => null],
            ],
        ])->assertStatus(204);

    // Now test that the sequence of the blocks is the inverse
    $this->assertEquals(1, $form->formBlocks[0]->fresh()->sequence);
    $this->assertEquals(0, $form->formBlocks[1]->fresh()->sequence);
});

test('can_add_a_scope_to_blocks', function () {
    $form = Form::factory()
        ->has(FormBlock::factory(['sequence' => 0, 'type' => FormBlockType::group]))
        ->has(FormBlock::factory(['sequence' => 1]))
        ->create();

    $this->assertEquals(0, $form->formBlocks[0]->sequence);
    $this->assertEquals(1, $form->formBlocks[1]->sequence);

    $this->actingAs($form->user)
        ->json('POST', route('api.blocks.sequence', ['form' => $form->uuid]), [
            'sequence' => [
                ['id' => $form->formBlocks[0]->id, 'scope' => null],
                ['id' => $form->formBlocks[1]->id, 'scope' => $form->formBlocks[0]->uuid],
            ],
        ])->assertStatus(204);

    // Now test that the sequence of the blocks is the inverse
    $this->assertEquals(0, $form->formBlocks[0]->fresh()->sequence);
    $this->assertEquals(1, $form->formBlocks[1]->fresh()->sequence);
    $this->assertEquals($form->formBlocks[0]->uuid, $form->formBlocks[1]->fresh()->parent_block);
});

test('moving a group into a group is refused and changes nothing', function () {
    $form = Form::factory()
        ->has(FormBlock::factory(['sequence' => 0, 'type' => FormBlockType::group]))
        ->has(FormBlock::factory(['sequence' => 1, 'type' => FormBlockType::group]))
        ->create();
    [$first, $second] = $form->formBlocks->all();

    $this->actingAs($form->user)
        ->json('POST', route('api.blocks.sequence', ['form' => $form->uuid]), [
            'sequence' => [
                ['id' => $second->id, 'scope' => null],
                ['id' => $first->id, 'scope' => $second->uuid],
            ],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('sequence.1.scope');

    expect($first->fresh()->only('sequence', 'parent_block'))->toBe(['sequence' => 0, 'parent_block' => null])
        ->and($second->fresh()->sequence)->toBe(1);
});

test('a block can only go into a top-level group of the same form', function (Closure $scope) {
    $form = Form::factory()
        ->has(FormBlock::factory(['sequence' => 0, 'type' => FormBlockType::group]))
        ->has(FormBlock::factory(['sequence' => 1]))
        ->create();
    [$group, $block] = $form->formBlocks->all();

    $this->actingAs($form->user)
        ->json('POST', route('api.blocks.sequence', ['form' => $form->uuid]), [
            'sequence' => [
                ['id' => $block->id, 'scope' => $scope($group)],
                ['id' => $group->id, 'scope' => null],
            ],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('sequence.0.scope');

    expect($block->fresh()->only('sequence', 'parent_block'))->toBe(['sequence' => 1, 'parent_block' => null]);
})->with([
    'a group of another form' => fn () => fn () => FormBlock::factory()->create(['type' => FormBlockType::group])->uuid,
    'a question' => fn () => fn ($group) => FormBlock::factory()->for($group->form)->create()->uuid,
    'a group inside a group' => fn () => fn ($group) => FormBlock::factory()->for($group->form)
        ->create(['type' => FormBlockType::group, 'parent_block' => $group->uuid])->uuid,
]);

test('blocks of another form can\'t be moved', function () {
    $form = Form::factory()->has(FormBlock::factory(['sequence' => 0]))->create();
    $other = FormBlock::factory()->create(['sequence' => 5]);

    $this->actingAs($form->user)
        ->json('POST', route('api.blocks.sequence', ['form' => $form->uuid]), [
            'sequence' => [
                ['id' => $other->id, 'scope' => null],
                ['id' => $form->formBlocks[0]->id, 'scope' => null],
            ],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('sequence.0.id');

    expect($other->fresh()->sequence)->toBe(5)
        ->and($form->formBlocks[0]->fresh()->sequence)->toBe(0);
});

test('a reorder without a scope is refused and saves nothing', function () {
    $form = Form::factory()
        ->has(FormBlock::factory(['sequence' => 0]))
        ->has(FormBlock::factory(['sequence' => 1]))
        ->create();
    [$first, $second] = $form->formBlocks->all();

    $this->actingAs($form->user)
        ->json('POST', route('api.blocks.sequence', ['form' => $form->uuid]), [
            'sequence' => [
                ['id' => $second->id, 'scope' => null],
                ['id' => $first->id],
            ],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('sequence.1.scope');

    expect($first->fresh()->sequence)->toBe(0)
        ->and($second->fresh()->sequence)->toBe(1);
});
