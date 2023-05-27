<?php

namespace App\Models\Traits;

use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;

trait TemplateExportsAndImports
{
    public function toTemplate()
    {
        $this->load('formBlocks.formBlockInteractions');

        $form = $this->only(Form::TEMPLATE_ATTRIBUTES);

        $blocks = $this->formBlocks->map(function ($block) {
            return $block->toTemplate();
        })->toArray();

        return array_merge($form, [
            'blocks' => $blocks,
        ]);
    }

    public function applyTemplate(array|string $template)
    {
        if (!is_array($template)) {
            $template = collect(json_decode($template, true));
        } else {
            $template = collect($template);
        }

        $blocks = $template->has('blocks') ? collect($template['blocks']) : [];

        $this->update(
            $template->only(Form::TEMPLATE_ATTRIBUTES)->toArray()
        );

        // Clear out current form blocks (and their interactions)
        $this->formBlocks()->delete();

        // Create new form blocks
        $blocks->each(function ($item) {
            $item = collect($item);
            $block = $this->formBlocks()
                ->create(
                    $item
                        ->only(FormBlock::TEMPLATE_ATTRIBUTES)
                        ->toArray()
                );

            // Attach the form blocks interactions, if they exist
            if ($item->has('formBlockInteractions') && count((array) $item->get('formBlockInteractions', []))) {
                collect($item->get('formBlockInteractions', []))->each(function ($interaction) use ($block) {
                    $block->formBlockInteractions()->create(
                        collect($interaction)
                            ->only(FormBlockInteraction::TEMPLATE_ATTRIBUTES)
                            ->toArray()
                    );
                });
            };
        });
    }
}
