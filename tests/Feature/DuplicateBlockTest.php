<?php

use App\Enums\FormBlockInteractionType;
use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormBlockLogic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->form = Form::factory()->create();

    // positions with gaps, as deleting a block leaves them
    $this->first = FormBlock::factory()->for($this->form)->create(['sequence' => 0]);
    $this->block = FormBlock::factory()->for($this->form)->create([
        'sequence' => 4,
        'type' => FormBlockType::radio,
        'title' => 'Pick one',
        'message' => 'Which color do you like?',
        'options' => ['randomize' => true],
        'is_required' => true,
        'is_disabled' => false,
    ]);
    $this->last = FormBlock::factory()->for($this->form)->create(['sequence' => 9]);

    FormBlockInteraction::factory()->for($this->block)->create(['label' => 'Red', 'sequence' => 0]);
    FormBlockInteraction::factory()->for($this->block)->customResponse()->create(['label' => 'Other', 'sequence' => 1, 'options' => ['max_chars' => 20]]);
    FormBlockLogic::factory()->for($this->block)->create();

    $this->order = fn () => $this->form->formBlocks()->pluck('uuid')->all();
});

test('duplicating a question copies it right after the original, without its rules', function () {
    $response = $this->actingAs($this->form->user)
        ->json('post', route('api.blocks.duplicate', $this->block))
        ->assertCreated()
        ->assertJson([
            'form_id' => $this->form->id,
            'type' => 'radio',
            // the Identifier names the answer in prefill links and webhooks, so the copy has none
            'title' => null,
            'message' => 'Which color do you like?',
            'options' => ['randomize' => true],
            'is_required' => true,
            'is_disabled' => false,
            'parent_block' => null,
            'logics' => [],
        ]);

    $copy = FormBlock::where('uuid', $response->json('uuid'))->firstOrFail();

    expect($copy->id)->not->toBe($this->block->id)
        ->and($this->block->fresh()->title)->toBe('Pick one')
        ->and(($this->order)())->toBe([$this->first->uuid, $this->block->uuid, $copy->uuid, $this->last->uuid])
        ->and($copy->formBlockLogics)->toHaveCount(0)
        ->and($this->block->fresh()->formBlockLogics)->toHaveCount(1);

    // the answers are copies with their own ids, in the same order
    $answers = fn (FormBlock $block) => $block->formBlockInteractions
        ->map->only(['type', 'name', 'label', 'options', 'sequence', 'is_editable', 'is_disabled'])
        ->all();

    expect($answers($copy))->toBe($answers($this->block->fresh()))
        ->and($copy->formBlockInteractions->pluck('uuid')->intersect($this->block->formBlockInteractions->pluck('uuid')))->toBeEmpty()
        ->and($response->json('interactions.*.label'))->toBe(['Red', 'Other'])
        ->and($response->json('interactions.1.type'))->toBe(FormBlockInteractionType::button->value);
});

test('the copy goes right after the original when older questions share a position', function () {
    // creating a block after a delete can give two blocks the same position
    $twin = FormBlock::factory()->for($this->form)->create(['sequence' => 4]);

    $response = $this->actingAs($this->form->user)
        ->json('post', route('api.blocks.duplicate', $this->block))
        ->assertCreated();

    $order = ($this->order)();
    $sequences = $this->form->formBlocks()->pluck('sequence')->all();

    expect($order[array_search($this->block->uuid, $order) + 1])->toBe($response->json('uuid'))
        ->and($order)->toContain($twin->uuid)
        ->and($sequences)->toBe(range(0, 4));
});

test('a question in a group is copied into the same group', function () {
    $group = FormBlock::factory()->for($this->form)->create(['sequence' => 10, 'type' => FormBlockType::group]);
    $child = FormBlock::factory()->for($this->form)->create(['sequence' => 11, 'parent_block' => $group->uuid]);
    $nextChild = FormBlock::factory()->for($this->form)->create(['sequence' => 12, 'parent_block' => $group->uuid]);

    $response = $this->actingAs($this->form->user)
        ->json('post', route('api.blocks.duplicate', $child))
        ->assertCreated()
        ->assertJson(['parent_block' => $group->uuid]);

    expect(array_slice(($this->order)(), -4))->toBe([$group->uuid, $child->uuid, $response->json('uuid'), $nextChild->uuid]);
});

test('a group can not be duplicated', function () {
    $group = FormBlock::factory()->for($this->form)->create(['sequence' => 10, 'type' => FormBlockType::group]);
    $before = $this->form->formBlocks()->get()->toArray();

    $this->actingAs($this->form->user)
        ->json('post', route('api.blocks.duplicate', $group))
        ->assertUnprocessable();

    expect($this->form->formBlocks()->get()->toArray())->toBe($before);
});

test('a failed duplicate leaves the form unchanged', function () {
    $before = [
        $this->form->formBlocks()->get()->toArray(),
        FormBlockInteraction::count(),
        FormBlockLogic::count(),
    ];

    // the second answer can't be copied
    FormBlockInteraction::creating(function ($interaction) {
        if ($interaction->label === 'Other') {
            throw new RuntimeException('disk full');
        }
    });

    $this->actingAs($this->form->user)
        ->json('post', route('api.blocks.duplicate', $this->block))
        ->assertServerError();

    expect([
        $this->form->formBlocks()->get()->toArray(),
        FormBlockInteraction::count(),
        FormBlockLogic::count(),
    ])->toBe($before);
});

test('a duplicate writes to the form first, so duplicates at the same time keep one position each', function () {
    DB::enableQueryLog();

    $this->block->duplicate();

    expect(DB::getQueryLog()[0]['query'])->toMatch('/^update [`"]forms[`"] set /');
});
