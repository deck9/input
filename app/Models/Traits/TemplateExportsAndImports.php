<?php

namespace App\Models\Traits;

use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockLogic;
use App\Enums\FormBlockType;
use App\Models\FormBlockInteraction;
use Illuminate\Support\Collection;

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
        if (! is_array($template)) {
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

        // Create new form blocks, as pairs of [template item, new block]
        $created = collect();

        $blocks->each(function ($item) use ($blocks, $created) {
            if (isset($item['parent_block'])) {
                return;
            }

            $block = $this->applyBlockTemplate($item);
            $created->push([$item, $block]);

            if ($block->type === FormBlockType::group) {
                $childBlocks = $blocks->filter(function ($child) use ($item) {
                    return $item['id'] === $child['parent_block'];
                });

                $childBlocks->each(function ($child) use ($block, $created) {
                    $created->push([$child, $this->applyBlockTemplate($child, $block->uuid)]);
                });
            }
        });

        // Logic rules can point to any block, so they come after all blocks exist
        $this->applyLogicTemplates($created);
    }

    protected function applyLogicTemplates(Collection $created)
    {
        $newUuids = $created
            ->filter(fn ($pair) => isset($pair[0]['id']))
            ->mapWithKeys(fn ($pair) => [$pair[0]['id'] => $pair[1]->uuid]);

        $created->each(function ($pair) use ($newUuids) {
            [$item, $block] = $pair;

            collect($item['formBlockLogics'] ?? [])->each(function ($logic) use ($block, $newUuids) {
                $logic = collect($logic)->only(FormBlockLogic::TEMPLATE_ATTRIBUTES)->toArray();
                $isGoto = $logic['action'] === 'goto' && isset($logic['action_payload']);

                $targets = collect($logic['conditions'])
                    ->pluck('source')
                    ->when($isGoto, fn ($targets) => $targets->push($logic['action_payload']));

                // a rule that points to a block missing from the template is dropped
                if ($targets->contains(fn ($target) => ! $newUuids->has($target))) {
                    return;
                }

                $logic['conditions'] = collect($logic['conditions'])
                    ->map(fn ($condition) => array_merge($condition, ['source' => $newUuids[$condition['source']]]))
                    ->all();

                if ($isGoto) {
                    $logic['action_payload'] = $newUuids[$logic['action_payload']];
                }

                $block->formBlockLogics()->create($logic);
            });
        });
    }

    protected function applyBlockTemplate($item, $newParentBlock = null)
    {
        $item = collect($item);

        $attributes = $item
        ->only(FormBlock::TEMPLATE_ATTRIBUTES)
        ->toArray();

        if ($newParentBlock) {
            $attributes['parent_block'] = $newParentBlock;
        }

        $block = $this->formBlocks()->create($attributes);

        // Attach the form blocks interactions, if they exist
        if ($item->has('formBlockInteractions') && count((array) $item->get('formBlockInteractions', []))) {
            collect($item->get('formBlockInteractions', []))->each(function ($interaction) use ($block) {
                $block->formBlockInteractions()->create(
                    collect($interaction)
                        ->only(FormBlockInteraction::TEMPLATE_ATTRIBUTES)
                        ->toArray()
                );
            });
        }

        return $block;
    }
}
