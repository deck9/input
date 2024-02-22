<?php

namespace Tests\Feature;

use App\Models\Form;
use App\Models\FormSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

dataset('uploadForm', [
    '{"description":null,"language":"en","avatar_path":null,"background_path":null,"brand_color":"#1f2937","text_color":null,"background_color":null,"eoc_text":null,"eoc_headline":null,"data_retention_days":null,"is_auto_delete_enabled":false,"legal_notice_link":null,"privacy_link":null,"cta_label":null,"cta_link":null,"cta_append_params":false,"cta_redirect_delay":0,"use_cta_redirect":false,"cta_append_session_id":false,"linkedin":null,"github":null,"instagram":null,"facebook":null,"twitter":null,"show_cta_link":false,"show_social_links":false,"use_brighter_inputs":false,"show_form_progress":false,"blocks":[{"type":"input-file","message":"<p>File Upload Test<\/p>","title":null,"options":null,"is_required":false,"is_disabled":false,"parent_block":null,"sequence":0,"formBlockInteractions":[{"type":"input","name":null,"is_editable":true,"is_disabled":false,"label":null,"options":{"allowedFileTypes":[],"allowedFiles":10,"allowedFileSize":4},"message":null,"sequence":0},{"type":"file","name":null,"is_editable":true,"is_disabled":false,"label":null,"options":{"allowedFileTypes":{"image":true,"video":true,"audio":true,"text":true},"allowedFiles":"2","allowedFileSize":"4"},"message":null,"sequence":1}]}]}',
]);

test('can upload a file through special endpoint and attach it to the session', function ($template) {
    $form = Form::factory()->create();
    $form->applyTemplate($template);

    $session = FormSession::factory()->create(['form_id' => $form->id]);

    $this->json('POST', route('api.public.forms.submit', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'payload' => [
            ...$form->formBlocks[0]->getSubmitPayload(1),
        ],
    ])->assertStatus(200);

    $file = UploadedFile::fake()->image('face.png');

    $response = $this->json('POST', route('api.public.forms.file-upload', [
        'form' => $form->uuid,
    ]), [
        'token' => $session->token,
        'actionId' => $form->formBlocks[0]->formBlockInteractions[0]->uuid,
        'file' => $file,
    ])->assertStatus(201);

    $form->refresh();

    $this->assertCount(
        1,
        $form->formBlocks[0]
            ->formBlockInteractions[0]
            ->formSessionResponses[0]
            ->formSessionUploads
    );
})->with('uploadForm');
