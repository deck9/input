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
