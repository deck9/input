<?php

namespace Tests\Feature\Forms;

use Tests\TestCase;
use App\Models\Form;
use App\Models\User;
use App\Models\FormBlock;
use App\Enums\FormBlockType;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_create_a_new_form()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('api.forms.create'))
            ->assertSuccessful();

        $form = Form::get()->last();

        $this->assertEquals($user->id, $form->user_id);
        $this->assertNotNull($form->name);
    }

    /** @test */
    public function when_creating_a_new_form_the_data_privacy_mode_should_not_be_enabled()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('api.forms.create'));
        $form = Form::get()->last();

        $this->assertFalse($form->has_data_privacy);
    }

    /** @test */
    public function a_created_form_should_have_a_default_consent_snippet()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('api.forms.create'));
        $form = Form::get()->last();

        $this->assertCount(1, $form->blocks);
        $block = $form->blocks->first();
        $this->assertEquals(FormBlockType::consent, $block->type);
    }

    /** @test */
    public function authenticated_user_can_view_the_edit_page_of_his_form()
    {
        $form = Form::factory()->create();

        // test response for unauthorized user
        /** @var User $otherUser */
        $otherUser = User::factory()->create();
        $responseA = $this->actingAs($otherUser)
            ->get(route('forms.edit', $form->uuid));
        $responseA->assertStatus(404);

        // test response for authorized user
        $this->actingAs($form->user)->get(route('forms.edit', $form->uuid))
            ->assertStatus(200)
            ->assertInertia(
                fn ($page) => $page
                    ->component('Forms/Edit')
                    ->has('form')
                    ->where('form.uuid', fn ($value) => $value === $form->uuid)
            );
    }

    /** @test */
    public function can_retrieve_the_form_data()
    {
        $form = Form::factory()->create();

        $response = $this->actingAs($form->user)
            ->get(route('api.forms.show', $form->uuid));

        $response->assertStatus(200);
        $this->assertEquals($form->uuid, $response->json('uuid'));
    }

    /** @test */
    public function can_update_the_form_data_with_api_call()
    {
        $form = Form::factory()->create();

        $updateRequest = [
            'name' => 'New Name',
            'description' => 'better description',

            // Theme Options
            'brand_color' => '#ffffff',
            'message_background_color' => '#ffffff',
            'message_text_color' => '#ffffff',
            'user_message_background_color' => '#ffffff',
            'user_message_text_color' => '#ffffff',
            'interaction_background_color' => '#ffffff',
            'interaction_text_color' => '#ffffff',

            // Social Settings
            'twitter' => 'philreinking',
            'facebook' => 'philreinking',
            'instagram' => 'philreinking',
            'github' => 'philreinking',
            'linkedin' => 'philreinking',
            'show_social_links' => true,

            // CTA Settings
            'cta_link' => 'https://philreinking.de',
            'cta_label' => 'Proceed',
            'show_cta_link' => true,

            // GDPR Related Information
            'has_data_privacy' => true,
            'privacy_link' => 'https://philreinking.de/privacy',
            'legal_notice_link' => 'https://philreinking.de/legal-notice',
            'data_retention_days' => 90,

            // End of Conversation
            'eoc_headline' => 'Thank You',
            'eoc_text' => 'You can close this window now',
        ];

        $this->actingAs($form->user)
            ->json('POST', route('api.forms.update', $form->uuid), $updateRequest)
            ->assertSuccessful()
            ->assertJsonFragment($updateRequest);

        // refresh form data
        $form = $form->fresh();

        $this->assertEquals('New Name', $form->name);
        $this->assertEquals('better description', $form->description);

        $this->assertEquals('#ffffff', $form->brand_color);
        $this->assertEquals('#ffffff', $form->message_background_color);
        $this->assertEquals('#ffffff', $form->message_text_color);
        $this->assertEquals('#ffffff', $form->user_message_background_color);
        $this->assertEquals('#ffffff', $form->user_message_text_color);
        $this->assertEquals('#ffffff', $form->interaction_background_color);
        $this->assertEquals('#ffffff', $form->interaction_text_color);

        $this->assertTrue($form->show_social_links);
        $this->assertEquals('philreinking', $form->twitter);
        $this->assertEquals('philreinking', $form->facebook);
        $this->assertEquals('philreinking', $form->instagram);
        $this->assertEquals('philreinking', $form->github);
        $this->assertEquals('philreinking', $form->linkedin);

        $this->assertEquals('https://philreinking.de', $form->cta_link);
        $this->assertEquals('Proceed', $form->cta_label);
        $this->assertTrue($form->show_cta_link);


        $this->assertEquals('https://philreinking.de/privacy', $form->privacy_link);
        $this->assertEquals('https://philreinking.de/legal-notice', $form->legal_notice_link);
        $this->assertEquals(90, $form->data_retention_days);
        $this->assertTrue($form->has_data_privacy);

        $this->assertEquals('Thank You', $form->eoc_headline);
        $this->assertEquals('You can close this window now', $form->eoc_text);
    }

    /** @test */
    public function can_not_update_form_of_other_users()
    {
        $form = Form::factory()->create();

        $updateRequest = [
            'name' => 'New Name',
            'description' => 'better description',
        ];

        /** @var User $newUser */
        $newUser = User::factory()->create();

        $this->actingAs($newUser)
            ->json('POST', route('api.forms.update', $form->uuid), $updateRequest)
            ->assertStatus(404);
    }

    /** @test */
    public function can_delete_a_form()
    {
        $form = Form::factory()->create();

        $this->actingAs($form->user)
            ->json('DELETE', route('api.forms.delete', $form->uuid))
            ->assertStatus(200);

        $this->assertNotNull($form->fresh()->deleted_at);
    }

    /** @test */
    public function can_enable_or_disable_email_notifications_for_a_form()
    {
        $form = Form::factory()->create();

        $updateRequestA = [
            'is_notification_via_mail' => true,
        ];

        $this->actingAs($form->user)
            ->json('POST', route('api.forms.update', $form->uuid), $updateRequestA);

        // refresh form
        $form = $form->fresh();
        $this->assertTrue($form->is_notification_via_mail);

        $updateRequestB = [
            'is_notification_via_mail' => false,
        ];

        $this->actingAs($form->user)
            ->json('POST', route('api.forms.update', $form->uuid), $updateRequestB);

        // refresh form
        $form = $form->fresh();
        $this->assertNotTrue($form->is_notification_via_mail);
    }
}
