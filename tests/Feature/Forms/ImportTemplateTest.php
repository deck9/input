<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use App\Models\User;
use App\Enums\FormBlockType;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ImportTemplateTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_import_a_string_template_for_an_existing_form()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $form = Form::factory()->create([
            'name' => 'Test Form',
            'description' => 'A template Import Test',
            'user_id' => $user->id
        ]);

        $importTemplateString = file_get_contents(base_path('tests/form.template.json'));

        $response = $this->actingAs($user)->post(route('api.forms.template-import', [
            'form' => $form->uuid
        ]), [
            'template' => $importTemplateString,
        ])->assertStatus(200);

        $this->assertNotNull($response->json('message'));

        $form->refresh();

        $this->assertEquals('Form Import Test', $form->name);
        $this->assertEquals('This is just a test', $form->description);
        $this->assertEquals($user->id, $form->user_id);
        $this->assertCount(3, $form->formBlocks);

        $this->assertCount(1, $form->formBlocks[1]->formBlockInteractions);
        $this->assertEquals(FormBlockType::short, $form->formBlocks[1]->type);

        $this->assertCount(2, $form->formBlocks[2]->formBlockInteractions);
        $this->assertEquals(FormBlockType::radio, $form->formBlocks[2]->type);
    }

    /** @test */
    public function can_import_a_file_template_for_an_existing_form()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $form = Form::factory()->create([
            'name' => 'Test Form',
            'description' => 'A template Import Test',
            'user_id' => $user->id
        ]);

        $templateFile = UploadedFile::fake()->createWithContent(
            'form.template.json',
            file_get_contents(base_path('tests/form.template.json'))
        );

        $response = $this->actingAs($user)->post(route('api.forms.template-import', [
            'form' => $form->uuid
        ]), [
            'file' => $templateFile,
        ])->assertOk();

        $this->assertNotNull($response->json('message'));

        $form->refresh();

        $this->assertEquals('Form Import Test', $form->name);
        $this->assertEquals('This is just a test', $form->description);
        $this->assertEquals($user->id, $form->user_id);
        $this->assertCount(3, $form->formBlocks);

        $this->assertCount(1, $form->formBlocks[1]->formBlockInteractions);
        $this->assertEquals(FormBlockType::short, $form->formBlocks[1]->type);

        $this->assertCount(2, $form->formBlocks[2]->formBlockInteractions);
        $this->assertEquals(FormBlockType::radio, $form->formBlocks[2]->type);
    }
}
