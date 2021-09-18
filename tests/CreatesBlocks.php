<?php

namespace Tests;

use App\Models\Form;
use App\Models\FormBlock;

trait CreatesBlocks
{
    private function createBlock($overwrites = [])
    {
        $form = Form::factory()->create();
        $block = FormBlock::factory()->make(array_merge([
            'type' => 'question',
            'responses' => [
                ['content' => 'Yes'],
                ['content' => 'No'],
            ]
        ], $overwrites));

        $form->blocks()->save($block);

        return $block;
    }

    private function createBlocks($blocks = [])
    {
        $form = Form::factory()->create();

        $blockModels = [];

        foreach ($blocks as $block) {
            $blockModels[] = FormBlock::factory()->make($block);
        }

        $form->blocks()->saveMany($blockModels);

        return $blockModels;
    }
}
