<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Form;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormSessionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_create_a_new_form_session()
    {
        $form = Form::factory()->create();

        $response = $this->json('POST', route('api.public.forms.session.create', [
            'uuid' => $form->uuid,
        ]))->assertStatus(201);

        $this->assertNotNull($response->json('token'));
        $this->assertEquals(32, strlen($response->json('token')));
    }

    /** @test */
    public function parameters_can_be_saved_with_new_session()
    {
        $form = Form::factory()->create();

        $this->json('POST', route('api.public.forms.session.create', [
            'uuid' => $form->uuid,
            'params' => [
                'foo' => 'bar',
                'boo' => 'faz',
            ],
        ]))->assertStatus(201);

        $session = $form->fresh()->sessions()->first();
        $this->assertCount(2, $session->params);
    }
}
