<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Form;
use App\Models\FormSessionResponse;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormSessionTest extends TestCase
{
    use RefreshDatabase;

    protected $importTemplateString = <<<'EOD'
    {"name":"MailFrog Newsletter Sign-Up","description":"Test","eoc_text":"To complete the signup for our newsletter, we send you an email with a link to confirm your address.","eoc_headline":"Please check your inbox","cta_label":"Go To Homepage","cta_link":"https://getinput.co","linkedin":null,"github":null,"instagram":null,"facebook":null,"twitter":null,"show_cta_link":false,"show_social_links":false,"blocks":[{"message":"<p>Hey, thanks for your interest in the MailFrog newsletter.</p><p><strong>Please insert your e-mail address.</strong></p>","type":"input-email","title":null,"has_parent_interaction":null,"sequence":0,"interactions":[{"type":"input","label":"froggy@mailfrog.com","reply":null,"sequence":0}]},{"message":"<p><strong>Thank You! 🐸🐸🐸</strong><br>After confirming your email, we subscribe you to our list. Do you mind answering a few questions?</p>","type":"none","title":null,"has_parent_interaction":null,"sequence":1,"interactions":[]},{"message":"<p>Is this the first time you are visiting <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"http://mailfrog.com\">mailfrog.com</a>?</p>","type":"radio","title":null,"has_parent_interaction":null,"sequence":2,"interactions":[{"type":"button","label":"Yes","reply":null,"sequence":0},{"type":"button","label":"No","reply":null,"sequence":1}]},{"message":"<p><strong>What feature do you wish, MailFrog would offer?</strong></p>","type":"checkbox","title":null,"has_parent_interaction":null,"sequence":3,"interactions":[{"type":"button","label":"Transactional Mailing","reply":null,"sequence":0},{"type":"button","label":"Template API","reply":null,"sequence":1},{"type":"button","label":"Inbound Mail","reply":null,"sequence":2},{"type":"button","label":"Spam Protection","reply":null,"sequence":3}]}]}
EOD;

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

    /** @test */
    public function create_session_only_return_whitelisted_attributes()
    {
        $form = Form::factory()->create();

        $response = $this->json('POST', route('api.public.forms.session.create', [
            'uuid' => $form->uuid,
            'params' => [
                'foo' => 'bar',
                'boo' => 'faz',
            ],
        ]))->assertStatus(201);

        $response->assertJsonStructure([
            "token",
            "has_data_privacy",
            "is_completed",
            "params",
            "created_at",
        ]);
    }

    /** @test */
    public function can_submit_a_form()
    {
        $this->withoutExceptionHandling();
        $form = Form::factory()->create();
        $form->applyTemplate($this->importTemplateString);

        $response = $this->json('POST', route('api.public.forms.session.create', [
            'uuid' => $form->uuid,
        ]))->assertStatus(201);

        $token = $response->json('token');

        $submitted = $this->json('POST', route('api.public.forms.submit', [
            'uuid' => $form->uuid
        ]), [
            'token' => $token,
            'payload' => [
                'jR' => ['actionId' => 'jR', 'payload' => 'tester@getinput.co'],
                'l5' => ['actionId' => 'k5', 'payload' => 'Yes'],
                'mO' => [
                    ['actionId' => 'mO', 'payload' => 'Transactional Mailing'],
                    ['actionId' => 'nR', 'payload' => 'Template API']
                ],
            ]
        ]);

        $form->refresh();
        $submitted->assertStatus(200);
        $this->assertCount(1, $form->blocks[0]->interactions[0]->responses);
        $this->assertCount(4, $form->responses);
    }
}
