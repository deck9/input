<?php

namespace App\Models\Traits;

use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;

trait TemplateImports
{
    public function toTemplate()
    {
        $this->load('blocks.interactions');

        $form = $this->only(Form::TEMPLATE_ATTRIBUTES);

        $blocks = $this->blocks->map(function ($block) {
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
            $template->only(Form::TEMPLATE_ATTRIBUTES)->toArray()
        );

        $this->blocks()->delete();

        $blocks->each(function ($item) {
            $item = collect($item);
            $block = $this->blocks()
                ->create(
                    $item
                        ->only(FormBlock::TEMPLATE_ATTRIBUTES)
                        ->toArray()
                );

            if ($item->has('interactions') && count((array) $item->get('interactions', []))) {
                collect($item->get('interactions', []))->each(function ($interaction) use ($block) {
                    $block->interactions()->create(
                        collect($interaction)
                            ->only(FormBlockInteraction::TEMPLATE_ATTRIBUTES)
                            ->toArray()
                    );
                });
            };
        });
    }
}
