<?php

namespace Tests\Feature\Forms\Interactions;

use Tests\TestCase;
use App\Enums\FormBlockType;
use App\Models\FormBlockInteraction;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Forms\Interactions\InteractionsTestingContract;

class InputLongTest extends TestCase
{
    use RefreshDatabase, InteractionsTestingContract;

    protected $blockType = FormBlockType::long;
    protected $interactionType = FormBlockInteractionType::textarea;
}
