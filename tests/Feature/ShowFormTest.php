<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Form;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShowFormTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function cannot_view_unpublished_form()
    {
        $form  = Form::factory()->unpublished()->create();

        $this->get(route('forms.show', ['uuid' => $form->uuid]))
            ->assertStatus(404);
    }

    /** @test */
    public function can_view_the_form_view_when_form_is_unpublished_but_owner()
    {
        $form  = Form::factory()->unpublished()->create();

        $this->actingAs($form->user)->get(route('forms.show', ['uuid' => $form->uuid]))
            ->assertStatus(200);
    }

    /** @test */
    public function cannot_view_the_form_view_when_form_is_unpublished_and_other_user()
    {
        $form  = Form::factory()->unpublished()->create();

        /** @var User $other */
        $other = User::factory()->create();

        $this->actingAs($other)->get(route('forms.show', ['uuid' => $form->uuid]))
            ->assertStatus(404);
    }

    /** @test */
    public function can_view_the_form_view_when_form_is_published()
    {
        $form  = Form::factory()->create();

        $this->get(route('forms.show', ['uuid' => $form->uuid]))
            ->assertStatus(200);
    }

    /** @test */
    public function can_view_published_forms_meta_data()
    {
        $form = Form::factory()->create();
        $response = $this->json('GET', route('api.public.forms.show', $form));

        $response->assertOk();
    }
}
