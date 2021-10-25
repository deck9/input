<?php

namespace Tests\Feature\Forms\Interactions;

use Tests\TestCase;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Forms\Interactions\InteractionsTestingContract;

class MultipleChoiceInteractionTest extends TestCase
{
    use RefreshDatabase, InteractionsTestingContract;

    protected function getInteractionType()
    {
        return FormBlockInteraction::TYPE_CLICK;
    }
}
