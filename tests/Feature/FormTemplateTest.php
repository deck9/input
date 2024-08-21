<?php

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;

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
