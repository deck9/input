<?php

namespace App\Http\Controllers\Api;

use App\Models\FormBlock;
use App\Enums\FormBlockType;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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
