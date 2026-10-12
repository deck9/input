<?php

use App\Models\Form;
use App\Models\User;
use App\Models\FormBlock;
use App\Enums\FormBlockType;
use App\Models\FormBlockLogic;
use Database\Seeders\SimpleFormSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('can create new blocks', function () {
    $form = Form::factory()->create();

    $response = $this->actingAs($form->user)
        ->json('post', route('api.blocks.create', $form->uuid))
        ->assertSuccessful();

    $block = FormBlock::get()->last();

    $this->assertEquals($block->uuid, $response->json('uuid'));
    $this->assertEquals($form->id, $response->json('form_id'));
    $this->assertEquals($block->type, FormBlockType::none);
});

test('can create a new block of type group', function () {
    $form = Form::factory()->create();

    $response = $this->actingAs($form->user)
        ->json('post', route('api.blocks.create', $form->uuid), [
            'type' => 'group',
        ])
        ->assertSuccessful();

    $block = FormBlock::get()->last();

    $this->assertEquals($block->uuid, $response->json('uuid'));
    $this->assertEquals($form->id, $response->json('form_id'));
    $this->assertEquals($block->type, FormBlockType::group);
});

test('can only create blocks for forms that a user owns', function () {
    /** @var User $otherUser */
    $otherUser = User::factory()->withTeam()->create([]);
    $form = Form::factory()->create();

    $this->actingAs($otherUser)
        ->json('post', route('api.blocks.create', $form))
        ->assertStatus(403);

});

test('can get blocks related to a form', function () {
    $form = Form::factory()->create();

    FormBlock::factory()->count(5)->create([
        'form_id' => $form->id,
    ]);

    $response = $this->actingAs($form->user)
        ->json('get', route('api.blocks.index', $form->uuid));

    $response->assertStatus(200);
    $this->assertCount(5, $response->json());
});

test('can get a block with logic', function () {
    $form = Form::factory()->create();
    $block = FormBlock::factory()->for($form)->create();
    $logic = FormBlockLogic::factory()->create([
        'form_block_id' => $block->id,
    ]);

    $response = $this->actingAs($form->user)
        ->json('get', route('api.blocks.index', $form->uuid));

    $response->assertStatus(200);
    $this->assertCount(1, $response->json('0.logics'));
});

test('can get blocks with results loaded', function () {
    $this->seed(SimpleFormSeeder::class);
    $form = Form::first();

    $response = $this->actingAs($form->user)
        ->json('get', route('api.blocks.index', $form->uuid), [
            'includeSubmissions' => 'true',
        ]);

    $this->assertEquals(5, $response->json('1.session_count'));
    $this->assertEquals(5, $response->json('2.session_count'));
    $this->assertEquals(5, $response->json('3.session_count'));
    $this->assertNotNull($response->json('1.interactions.0.responses_count'));
    $this->assertNotNull($response->json('2.interactions.0.responses_count'));
});

test('can update existing blocks', function () {
    $block = FormBlock::factory()->create([
        'message' => 'Hey there',
        'type' => FormBlockType::none,
    ]);

    $response = $this->actingAs($block->form->user)
        ->json('post', route('api.blocks.update', $block->id), [
            'message' => 'Ok?',
            'type' => FormBlockType::radio,
        ])->assertSuccessful();

    $this->assertEquals('Ok?', $response->json('message'));
    $this->assertEquals(FormBlockType::radio->value, $response->json('type'));
});

test('can update a block with a empty message', function () {
    $block = FormBlock::factory()->create([
        'message' => 'Test Message',
        'type' => FormBlockType::none,
    ]);

    $response = $this->actingAs($block->form->user)
        ->json('post', route('api.blocks.update', $block->id), [
            'message' => null,
            'type' => FormBlockType::radio,
        ])->assertSuccessful();

    $this->assertNull($response->json('message'));
    $this->assertEquals(FormBlockType::radio->value, $response->json('type'));
});

test('cannot create or update blocks of not owned form', function () {
    /** @var User $otherUser */
    $otherUser = User::factory()->withTeam()->create();

    $block = FormBlock::factory()->create([
        'message' => 'Hey there',
        'type' => FormBlockType::none,
    ]);

    $this->actingAs($otherUser)
        ->json('post', route('api.blocks.create', $block->form->uuid))
        ->assertStatus(403);

    $this->actingAs($otherUser)
        ->json('post', route('api.blocks.update', $block->id), [
            'message' => 'Ok?',
            'type' => FormBlockType::radio,
        ])
        ->assertStatus(403);

    $this->assertEquals('Hey there', $block->fresh()->message);
    $this->assertEquals(FormBlockType::none, $block->fresh()->type);
});

test('can delete a block', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('DELETE', route('api.blocks.delete', $block->id))
        ->assertSuccessful();

    $this->assertNull($block->fresh());
});

test('a block id that is not a whole number is not found and changes nothing', function (string $suffix) {
    $block = FormBlock::factory()->create([
        'message' => 'Hey there',
        'type' => FormBlockType::none,
    ]);

    $this->actingAs($block->form->user)
        ->json('post', route('api.blocks.update', $block->id.$suffix), [
            'message' => 'Ok?',
            'type' => FormBlockType::radio,
        ])
        ->assertNotFound();

    $this->actingAs($block->form->user)
        ->json('DELETE', route('api.blocks.delete', $block->id.$suffix))
        ->assertNotFound();

    expect($block->fresh())
        ->message->toBe('Hey there')
        ->type->toBe(FormBlockType::none);
})->with(['xlf', '.0', 'e0']);

test('cannot delete blocks of other users', function () {
    /** @var User $otherUser */
    $otherUser = User::factory()->withTeam()->create();
    $block = FormBlock::factory()->create();

    $this->actingAs($otherUser)
        ->json('DELETE', route('api.blocks.delete', $block->id))
        ->assertStatus(403);

    $this->assertNotNull($block->fresh());
});

test('can set a title for the results view', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'title' => 'This is a block title',
        ]);

    $this->assertEquals('This is a block title', $block->fresh()->title);
});

test('can remove a title for the results view', function () {
    $block = FormBlock::factory()->create([
        'title' => 'Title is set',
    ]);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['title' => null]);

    $this->assertNull($block->fresh()->title);
});

test('a changed block title must fit its column', function () {
    $block = FormBlock::factory()->create(['title' => 'Old title']);
    $update = fn (string $title) => $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['title' => $title]);

    // the column counts letters, so a two-byte ä counts once
    $update(str_repeat('ä', 1025))->assertStatus(422)->assertJsonValidationErrors('title');

    expect($block->fresh()->title)->toBe('Old title');

    $update(str_repeat('ä', 1024))->assertSuccessful();

    expect($block->fresh()->title)->toBe(str_repeat('ä', 1024));
});

test('an unchanged old block title longer than its column does not block saving', function () {
    // the editor sends the whole block back; only SQLite keeps a value longer than its column
    $block = FormBlock::factory()->create(['title' => str_repeat('a', 1025)]);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'title' => str_repeat('a', 1025),
            'message' => 'Changed',
        ])
        ->assertSuccessful();

    expect($block->fresh()->message)->toBe('Changed');
})->skip(fn () => DB::getDriverName() !== 'sqlite', 'only SQLite keeps a value longer than its column');

test('a changed question text must fit its column, counted in bytes', function () {
    $block = FormBlock::factory()->create(['message' => 'Old text']);
    $update = fn (string $message) => $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['message' => $message]);

    // a TEXT column holds 65,535 bytes, and ä takes two
    $update(str_repeat('a', 65536))->assertStatus(422)->assertJsonValidationErrors('message');
    $update(str_repeat('ä', 32768))->assertStatus(422)->assertJsonValidationErrors('message');

    expect($block->fresh()->message)->toBe('Old text');

    $update(str_repeat('ä', 32767).'a')->assertSuccessful();

    expect($block->fresh()->message)->toBe(str_repeat('ä', 32767).'a');
});

test('a changed webhook address must fit its column', function () {
    $block = FormBlock::factory()->create(['webhook_url' => 'https://example.com/old']);
    // 20 characters before the path
    $update = fn (int $letters) => $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['webhook_url' => 'https://example.com/'.str_repeat('ä', $letters)]);

    // the column counts letters, so a two-byte ä counts once
    $update(236)->assertStatus(422)->assertJsonValidationErrors('webhook_url');

    expect($block->fresh()->webhook_url)->toBe('https://example.com/old');

    $update(235)->assertSuccessful();

    expect($block->fresh()->webhook_url)->toBe('https://example.com/'.str_repeat('ä', 235));
});

test('an unchanged old question text or webhook address larger than its column does not block saving', function (string $key, string $value) {
    // the editor sends the whole block back; only SQLite keeps a value larger than its column
    $block = FormBlock::factory()->create([$key => $value]);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            $key => $value,
            'title' => 'Changed',
        ])
        ->assertSuccessful();

    expect($block->fresh()->title)->toBe('Changed');
})->with([
    'question text' => ['message', str_repeat('a', 65536)],
    'webhook address' => ['webhook_url', 'https://example.com/'.str_repeat('a', 236)],
])->skip(fn () => DB::getDriverName() !== 'sqlite', 'only SQLite keeps a value larger than its column');

test('required and hidden on a question must be yes or no', function (string $key, mixed $value) {
    $block = FormBlock::factory()->create(['is_required' => true, 'is_disabled' => true]);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [$key => $value])
        ->assertStatus(422)
        ->assertJsonValidationErrors($key);

    expect($block->fresh()->$key)->toBeTrue();
})->with(['is_required', 'is_disabled'])->with([
    'text' => 'maybe',
    'a list' => [['yes']],
]);

test('a question can be left without required, but not without hidden', function () {
    $block = FormBlock::factory()->create(['is_required' => true, 'is_disabled' => true]);
    $update = fn (string $key) => $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [$key => null]);

    // only the required column takes empty
    $update('is_disabled')->assertStatus(422)->assertJsonValidationErrors('is_disabled');
    $update('is_required')->assertSuccessful();

    // raw, since the app reads an empty yes/no as no
    expect($block->fresh()->getRawOriginal('is_required'))->toBeNull()
        ->and($block->fresh()->is_disabled)->toBeTrue();
});

test('can make a block required for form user', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['is_required' => true]);

    $this->assertTrue($block->fresh()->is_required);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['is_required' => false]);

    $this->assertFalse($block->fresh()->is_required);
});

test('can save information in an options field', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'options' => [
                'title' => 'Test Title',
                'activities' => [],
            ],
        ]);

    $this->assertEquals('Test Title', $block->fresh()->options['title']);
});

it('can disable and enable a form block', function () {
    $block = FormBlock::factory()->create([
        'is_disabled' => false,
    ]);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'is_disabled' => true,
        ]);

    expect($block->fresh()->is_disabled)->toBeTrue();

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'is_disabled' => false,
        ]);

    expect($block->fresh()->is_disabled)->toBeFalse();
});

test('the blocks list names the rules that use each question', function () {
    $form = Form::factory()->create();
    $first = FormBlock::factory()->for($form)->create(['sequence' => 0]);
    $second = FormBlock::factory()->for($form)->create(['sequence' => 1]);
    $third = FormBlock::factory()->for($form)->create(['sequence' => 2]);
    $unused = FormBlock::factory()->for($form)->create(['sequence' => 3]);

    $condition = fn (FormBlock $source) => ['source' => $source->uuid, 'operator' => 'equals', 'value' => 'yes', 'chainOperator' => 'and'];
    $skip = FormBlockLogic::factory()->for($first)->create([
        'name' => 'Skip', 'conditions' => [$condition($third)], 'action' => 'goto', 'action_payload' => $third->uuid, 'evaluate' => 'after',
    ]);
    $jump = FormBlockLogic::factory()->for($second)->create([
        'name' => 'Jump', 'conditions' => [$condition($first)], 'action' => 'goto', 'action_payload' => $third->uuid, 'evaluate' => 'after',
    ]);
    $hide = FormBlockLogic::factory()->for($third)->create([
        'name' => 'Hide', 'conditions' => [$condition($first), $condition($second), $condition($first)], 'action' => 'hide', 'action_payload' => null,
    ]);

    $usedBy = fn (FormBlockLogic $rule, FormBlock $block, array $as) => ['id' => $rule->id, 'name' => $rule->name, 'block' => $block->uuid, 'as' => $as];

    $response = $this->actingAs($form->user)
        ->json('get', route('api.blocks.index', $form->uuid))
        ->assertOk();

    expect($response->json('*.used_by'))->toBe([
        [$usedBy($jump, $second, ['source']), $usedBy($hide, $third, ['source'])],
        [$usedBy($hide, $third, ['source'])],
        [$usedBy($skip, $first, ['source', 'target']), $usedBy($jump, $second, ['target'])],
        [],
    ]);
});
