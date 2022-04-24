<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Form;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShowFormTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_view_published_forms_meta_data()
    {
        $form = Form::factory()->create();
        $response = $this->json('GET', route('api.public.forms.show', $form));

        $response->assertOk();
    }
}
