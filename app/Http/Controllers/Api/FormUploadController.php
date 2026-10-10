<?php

namespace App\Http\Controllers\Api;

use App\Enums\FormBlockInteractionType;
use App\Enums\FormBlockType;
use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormBlockInteraction;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FormUploadController extends Controller
{
    // upload_max_filesize in scripts/php.conf.ini
    private const MAX_FILE_SIZE_MB = 8;

    // the editor's maximum
    private const MAX_FILES = 10;

    // same mapping as the form page (FileAction.vue)
    private const FILE_TYPES = [
        'image' => ['image/*'],
        'video' => ['video/*'],
        'audio' => ['audio/*'],
        'text' => ['application/*', 'text/*'],
    ];

    public function __invoke(Request $request, Form $form)
    {
        $request->validate([
            'token' => 'required|string',
            'actionId' => 'required|string',
            'file' => 'required|file',
        ]);

        // only look at the interactions of this form
        $interaction = FormBlockInteraction::withUuid($request->input('actionId'))
            ->whereHas('formBlock', fn ($query) => $query->where('form_id', $form->id))
            ->firstOrFail();

        $session = $form->formSessions()
            ->where('token', $request->input('token'))
            ->firstOrFail();

        $sessionResponse = $session->formSessionResponses->where('form_block_interaction_id', $interaction->id)->first();

        if ($interaction->formBlock->type !== FormBlockType::file) {
            throw ValidationException::withMessages(['actionId' => 'This question does not take files.']);
        }

        if (! $sessionResponse) {
            throw ValidationException::withMessages(['actionId' => 'Submit the answer before uploading its files.']);
        }

        // the limits live on the block's file interaction, like on the form page
        $options = $interaction->formBlock->formBlockInteractions
            ->firstWhere('type', FormBlockInteractionType::file)?->options ?? [];
        $maxFileSize = min((int) ($options['allowedFileSize'] ?? 0) ?: self::MAX_FILE_SIZE_MB, self::MAX_FILE_SIZE_MB);
        $maxFiles = (int) ($options['allowedFiles'] ?? 0) ?: self::MAX_FILES;
        $types = collect($options['allowedFileTypes'] ?? [])
            ->filter(fn ($allowed) => $allowed === true)
            ->flatMap(fn ($allowed, $type) => self::FILE_TYPES[$type] ?? []);

        $request->validate([
            'file' => array_filter([
                'max:'.($maxFileSize * 1024),
                $types->isNotEmpty() ? 'mimetypes:'.$types->implode(',') : null,
            ]),
        ]);

        if ($sessionResponse->formSessionUploads()->count() >= $maxFiles) {
            throw ValidationException::withMessages(['file' => "This question takes at most {$maxFiles} files."]);
        }

        $upload = $sessionResponse->saveUpload($request->file('file'));

        return response()->json($upload, 201);
    }
}
