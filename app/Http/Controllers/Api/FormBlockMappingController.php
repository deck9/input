<?php

namespace App\Http\Controllers\Api;

use App\Enums\FormBlockType;
use App\Http\Controllers\Controller;
use App\Models\FormBlock;

class FormBlockMappingController extends Controller
{
    public function __invoke()
    {
        $mapping = [];

        foreach (FormBlockType::cases() as $case) {

            $interactionType = with(new FormBlock(['type' => $case]))
                ->getInteractionType();

            if ($interactionType) {
                $mapping[$case->value] = $interactionType->value;
            }
        }

        return response()->json(['mapping' => $mapping], 200);
    }
}
