<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PublishFormTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_publish_a_form()
    {
        Event::fake();

        $form = Form::factory()->create(['published_at' =>  null]);

        $this->actingAs($form->user)
            ->json('POST', route('api.forms.publish', $form->uuid))
            ->assertStatus(200);

        $this->assertNotNull($form->fresh()->published_at);
    }

    /** @test */
    public function can_unpublish_a_form()
    {
        $form = Form::factory()->create(['published_at' =>  now()]);

        $this->actingAs($form->user)
            ->json('POST', route('api.forms.unpublish', $form->uuid))
            ->assertStatus(200);

        $this->assertNull($form->fresh()->published_at);
    }
}
