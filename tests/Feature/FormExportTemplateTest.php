<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Form;
use App\Models\FormBlock;
use App\Enums\FormBlockType;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormExportTemplateTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_export_a_form_as_a_string()
    {
        $form = Form::factory()->create([
            'name' => 'Test Form',
            'description' => 'A template Export Test',
            'brand_color' => '#487596',
        ]);

        $block = FormBlock::factory()->create([
            'message' => 'Hello World',
            'type' => FormBlockType::short,
            'sequence' => 0,
            'form_id' => $form->id,
        ]);

        FormBlockInteraction::factory()->create([
            'form_block_id' => $block->id,
            'type' => FormBlockInteractionType::input,
            'label' => 'Test Input'
        ]);

        $response = $this->actingAs($form->user)
            ->json('GET', route('api.forms.template-export', [
                'form' => $form->id,
            ]))->assertStatus(200);

        $response->assertJsonFragment([
            'name' => 'Test Form',
            'description' => 'A template Export Test',
        ]);
    }
}
