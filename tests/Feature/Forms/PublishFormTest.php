<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PublishFormTest extends TestCase
{
    use RefreshDatabase;

    /** @test @api */
    public function can_publish_a_chatbot()
    {
        Event::fake();

        $form = Form::factory()->create(['published_at' =>  null]);

        $this->actingAs($form->user)
            ->json('POST', route('api.forms.publish.create', $form->uuid))
            ->assertStatus(200);

        $this->assertNotNull($form->fresh()->published_at);
    }

    /** @test @api */
    public function can_unpublish_a_chatbot()
    {
        $form = Form::factory()->create(['published_at' =>  now()]);

        $this->actingAs($form->user)
            ->json('DELETE', route('api.forms.publish.delete', $form->uuid))
            ->assertStatus(200);

        $this->assertNull($form->fresh()->published_at);
    }
}
