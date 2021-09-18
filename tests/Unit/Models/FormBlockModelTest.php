<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\FormBlock;
use Tests\CreatesBlocks;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormBlockModelTest extends TestCase
{
    use RefreshDatabase, CreatesBlocks;

    /** @test */
    public function the_typing_delay_field_returns_time_in_milliseconds()
    {
        $snippetShort = FormBlock::factory()->make([
            'message' => 'This is a short sentence.',
        ]);

        $snippetLong = FormBlock::factory()->make([
            'message' => 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur consectetur soluta dolorum a vel? Iste, facere itaque labore expedita adipisci rerum sint, fugit sequi voluptas nemo enim deserunt ipsa cum!',
        ]);

        $this->assertEquals(750, $snippetShort->typingDelay());

        // the delay should be max 1500 ms
        $this->assertEquals(1500, $snippetLong->typingDelay());
    }

    /** @test */
    public function the_to_array_method_should_return_the_correct_fields()
    {
        $snippet = FormBlock::factory()->create();

        $this->assertArrayHasKey('id', $snippet->toArray());
        $this->assertArrayHasKey('type', $snippet->toArray());
        $this->assertArrayHasKey('message', $snippet->toArray());
        $this->assertArrayHasKey('typing_delay', $snippet->toArray());
    }

    /** @test */
    public function model_has_function_to_determine_if_the_type_expects_responses()
    {
        $snippetA = $this->createBlock([
            'type' => FormBlock::CLICK,
        ]);
        $snippetB = $this->createBlock([
            'type' => FormBlock::INPUT,
        ]);
        $snippetC = $this->createBlock([
            'type' => FormBlock::MESSAGE,
        ]);

        $this->assertEquals(true, $snippetA->hasResponseAction());
        $this->assertEquals(true, $snippetB->hasResponseAction());
        $this->assertEquals(false, $snippetC->hasResponseAction());
    }

    /** @test */
    public function has_scope_to_get_snippet_by_uuid()
    {
        $snippet = FormBlock::factory()->create();

        $result = FormBlock::withUuid($snippet->uuid)->first();

        $this->assertEquals($result->id, $snippet->id);
    }

    /** @test */
    public function has_scope_to_get_only_answerable_snippets()
    {
        $this->createBlock([
            'type' => FormBlock::INPUT,
        ]);
        $this->createBlock([
            'type' => FormBlock::MESSAGE,
        ]);

        $result = FormBlock::onlyInteractive()->get();

        $this->assertEquals(1, $result->count());
    }
}
