<?php

namespace Database\Seeders;

use App\Enums\FormBlockType;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SimpleFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user = User::first();

        $form = Form::factory()->create([
            'name' => 'Simple Form',
            'description' => 'This form is for testing purposes.',
            'brand_color' => '#000000',
            'user_id' => $user ? $user->id : User::factory()->create()->id,
        ]);

        $sessions = FormSession::factory(5)->create([
            'form_id' => $form,
        ]);

        FormBlock::factory()->create([
            'message' => 'Block with no message',
            'form_id' => $form->id,
        ]);

        $this->buildCheckbox($form, $sessions);
        $this->buildRadio($form, $sessions);
        $this->buildInput($form, $sessions, FormBlockType::short);
        $this->buildInput($form, $sessions, FormBlockType::number);
        $this->buildInput($form, $sessions, FormBlockType::email);
        $this->buildInput($form, $sessions, FormBlockType::phone);
        $this->buildInput($form, $sessions, FormBlockType::link);
    }

    public function buildCheckbox(Form $form, Collection $sessions)
    {
        // build checkbox block
        $block = FormBlock::factory()->create([
            'form_id' => $form->id,
            'type' => FormBlockType::checkbox,
            'message' => 'Checkbox block',
        ]);

        $checkboxInteractions = FormBlockInteraction::factory(4)->create([
            'type' => $block->getInteractionType(),
            'form_block_id' => $block->id,
        ]);

        $sessions->each(function ($session) use ($block, $checkboxInteractions) {
            for ($i = rand(1, 3); $i > 0; $i--) {
                $action = $checkboxInteractions->shuffle()->shift();

                $session->formSessionResponses()->create([
                    'value' => $action->label,
                    'form_block_id' => $block->id,
                    'form_block_interaction_id' => $action->id,
                ]);
            }
        });
    }

    public function buildRadio(Form $form, Collection $sessions)
    {
        // build checkbox block
        $block = FormBlock::factory()->create([
            'form_id' => $form->id,
            'type' => FormBlockType::radio,
            'message' => 'Radio block',
        ]);

        $checkboxInteractions = FormBlockInteraction::factory(4)->create([
            'type' => $block->getInteractionType(),
            'form_block_id' => $block->id,
        ]);

        $sessions->each(function ($session) use ($block, $checkboxInteractions) {
            $action = $checkboxInteractions->shuffle()->shift();

            $session->formSessionResponses()->create([
                'value' => $action->label,
                'form_block_id' => $block->id,
                'form_block_interaction_id' => $action->id,
            ]);
        });
    }

    public function buildInput(Form $form, Collection $sessions, FormBlockType $type)
    {
        // build checkbox block
        $block = FormBlock::factory()->create([
            'form_id' => $form->id,
            'type' => $type,
            'message' => $type->value.' block',
        ]);

        $action = FormBlockInteraction::factory()->create([
            'type' => $block->getInteractionType(),
            'form_block_id' => $block->id,
        ]);

        $sessions->each(function ($session) use ($block, $action) {
            $session->formSessionResponses()->create([
                'value' => Str::random(16),
                'form_block_id' => $block->id,
                'form_block_interaction_id' => $action->id,
            ]);
        });
    }
}
