<?php

namespace Tests\Feature;

use App\Enums\FormBlockType;
use Tests\TestCase;
use App\Models\Form;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormImportTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected $importTemplateString = <<<'EOD'
    {"name":"Form Import Test","description":"This is just a test","eoc_text":"Test Message","eoc_headline":"Test Completed","cta_label":"Test CTA","cta_link":"https://deck9.co","linkedin":null,"github":null,"instagram":null,"facebook":null,"twitter":null,"show_cta_link":true,"show_social_links":false,"blocks":[{"message":"<p>This is the first message</p>","type":"none","title":null,"has_parent_interaction":null,"sequence":0,"formBlockInteractions":[]},{"message":"<p>What is your name?</p>","type":"input-short","title":null,"has_parent_interaction":null,"sequence":1,"formBlockInteractions":[{"type":"input","label":"Your name","reply":null,"sequence":0}]},{"message":"<p>Planes or Trains?</p>","type":"radio","title":null,"has_parent_interaction":null,"sequence":2,"formBlockInteractions":[{"type":"button","label":"Planes","reply":null,"sequence":0},{"type":"button","label":"Trains","reply":null,"sequence":1}]}]}
EOD;

    /** @test */
    public function can_import_a_template_for_an_existing_form()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $form = Form::factory()->create([
            'name' => 'Test Form',
            'description' => 'A template Import Test',
            'user_id' => $user->id
        ]);

        $response = $this->actingAs($user)->post(route('api.forms.template-import', [
            'form' => $form->id
        ]), [
            'template' => $this->importTemplateString,
        ])->assertStatus(200);

        $this->assertNotNull($response->json('message'));

        $form->refresh();

        $this->assertEquals('Form Import Test', $form->name);
        $this->assertEquals('This is just a test', $form->description);
        $this->assertEquals($user->id, $form->user_id);
        $this->assertCount(3, $form->blocks);

        $this->assertCount(1, $form->blocks[1]->formBlockInteractions);
        $this->assertEquals(FormBlockType::short, $form->blocks[1]->type);

        $this->assertCount(2, $form->blocks[2]->formBlockInteractions);
        $this->assertEquals(FormBlockType::radio, $form->blocks[2]->type);
    }
}
