<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\FormBlock;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormBlockModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function the_to_array_method_should_return_the_correct_fields()
    {
        $block = FormBlock::factory()->create();

        $this->assertArrayHasKey('id', $block->toArray());
        $this->assertArrayHasKey('type', $block->toArray());
        $this->assertArrayHasKey('message', $block->toArray());
    }

    /** @test */
    public function has_scope_to_get_snippet_by_uuid()
    {
        $block = FormBlock::factory()->create();

        $result = FormBlock::withUuid($block->uuid)->first();

        $this->assertEquals($result->id, $block->id);
    }
}
