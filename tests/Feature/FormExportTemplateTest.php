<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Form;
use App\Models\FormBlock;
use Illuminate\Support\Arr;
use App\Enums\FormBlockType;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormExportTemplateTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_export_a_form_as_a_string()
    {
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
            'name' => 'Test Form',
            'description' => 'A template Export Test'
        ]);

        $this->assertNotNull($response->json('blocks.0.formBlockInteractions'));
    }

    /** @test */
    public function can_export_a_form_as_a_json_file()
    {
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
    }
}
