<?php

namespace App\Models\Traits;

use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;

trait TemplateExportsAndImports
{
    public function toTemplate()
    {
        $TEMPLATE_ATTRIBUTES = [
            'name',
            'description',
            'eoc_text',
            'eoc_headline',
            'cta_label',
            'cta_link',
            'linkedin',
            'github',
            'instagram',
            'facebook',
            'twitter',
            'show_cta_link',
            'show_social_links',
            'show_form_progress',
        ];

        $this->load('formBlocks.formBlockInteractions');

        $form = $this->only($TEMPLATE_ATTRIBUTES);

        $blocks = $this->formBlocks->map(function ($block) {
            return $block->toTemplate();
        })->toArray();

        return array_merge($form, [
            'blocks' => $blocks,
        ]);
    }

    public function applyTemplate(string $template)
    {
        $template = collect(json_decode($template, true));
        $blocks = $template->has('blocks') ? collect($template['blocks']) : [];

        $this->update(
            $template->toArray()
        );

        $this->formBlocks()->delete();

        $blocks->each(function ($item) {
            $item = collect($item);
            $block = $this->formBlocks()
                ->create(
                    $item
                        ->only(FormBlock::TEMPLATE_ATTRIBUTES)
                        ->toArray()
                );

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
