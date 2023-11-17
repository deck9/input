<?php

namespace App\Http\Controllers\Api;

use App\Enums\FormBlockType;
use App\Http\Controllers\Controller;
use App\Models\FormBlock;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

class FormBlockMappingController extends Controller
{
    /**
     * Get the form block mapping
     *
     * This endpoint returns the mapping between the form block types and the interaction types.
     */
    #[Group('Utilities')]
    #[Authenticated]
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
