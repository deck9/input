<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use App\Models\User;
use App\Models\FormIntegration;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormIntegrationTest extends TestCase
{
    use RefreshDatabase;


    /** @test */
    public function can_get_a_list_of_all_integrations_of_a_form()
    {
        $this->withoutExceptionHandling();
        $form = Form::factory()->create();

        FormIntegration::factory()->count(3)->create([
            'form_id' => $form->id
        ]);

        $response = $this->actingAs($form->user)->json('GET', route('api.forms.integrations.index', $form))
            ->assertSuccessful();

        $this->assertCount(3, $response->json());
    }

    /** @test */
    public function can_create_a_new_integration_for_form()
    {
        $form = Form::factory()->create();

        $this->assertCount(0, $form->formIntegrations);

        $response = $this->actingAs($form->user)->json('POST', route('api.forms.integrations.create', $form), [
            'name' => 'Test Integration',
            'webhook_url' => 'https://example.com/webhook',
            'webhook_method' => 'GET',
            'headers' => [
                'x-example' => 'test'
            ]
        ])->assertSuccessful();

        $this->assertNotNull($response->json('id'));
        $this->assertEquals('test', $response->json('headers.x-example'));

        $this->assertCount(1, $form->fresh()->formIntegrations);

        // assert that other user cannot create integration for form
        $this->actingAs(User::factory()->create())
            ->json('POST', route('api.forms.integrations.create', $form), [
                'name' => 'Test Integration',
                'webhook_url' => 'https://example.com/webhook',
                'webhook_method' => 'GET'
            ])
            ->assertStatus(403);
    }

    /** @test */
    public function can_update_a_created_integration()
    {
        $integration = FormIntegration::factory()->create();

        $response = $this->actingAs($integration->form->user)->json('POST', route('api.forms.integrations.update', [$integration->form, $integration]), [
            'name' => 'Test Integration',
            'webhook_url' => 'https://example.com/webhook',
            'webhook_method' => 'GET',
            'headers' => [
                'x-example' => 'test'
            ]
        ])->assertSuccessful();

        $response->assertJson([
            'name' => 'Test Integration',
            'webhook_url' => 'https://example.com/webhook',
            'webhook_method' => 'GET',
            'headers' => [
                'x-example' => 'test'
            ]
        ]);
    }

    /** @test */
    public function can_delete_a_form_integration()
    {
        $integration = FormIntegration::factory()->create();

        $this->assertCount(1, $integration->form->formIntegrations);

        $this->actingAs($integration->form->user)->json('DELETE', route('api.forms.integrations.delete', [$integration->form, $integration]))
            ->assertSuccessful();

        $this->assertCount(0, $integration->form->fresh()->formIntegrations);
    }
}
