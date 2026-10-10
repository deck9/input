<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FormBlockLogicRequest;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Knuckles\Scribe\Attributes\Group;

class FormTemplateImportController extends Controller
{
    /**
     * Import a form from template
     *
     * This endpoint imports a form from a template.
     *
     * @hideFromAPIDocumentation
     */
    #[Group('Templates')]
    public function __invoke(Request $request, Form $form)
    {
        if ($request->user()->cannot('update', $form)) {
            abort(403);
        }

        $request->validate([
            'file' => 'required_without:template|file|mimetypes:application/json',
            'template' => 'required_without:file|json',
        ]);

        $template = (array) json_decode(
            $request->has('file') ? file_get_contents($request->file('file')) : $request->input('template'),
            true
        );

        // image paths point to files of the form that uploaded them, the form keeps its own
        unset($template['avatar_path'], $template['background_path']);

        // same link rule as FormController::update()
        $link = ['nullable', 'regex:~^(https?://|mailto:)~i'];

        // same rules as creating a logic rule through the API
        $logicRules = collect((new FormBlockLogicRequest())->rules())
            ->mapWithKeys(fn ($rule, $key) => ["blocks.*.formBlockLogics.*.$key" => $rule]);

        Validator::make($template, [
            ...$logicRules->all(),
            'cta_link' => $link,
            'privacy_link' => $link,
            'legal_notice_link' => $link,
            'twitter' => $link,
            'facebook' => $link,
            'instagram' => $link,
            'github' => $link,
            'linkedin' => $link,
        ])->validate();

        $form->applyTemplate($template);

        return response()->json([
            'message' => 'Template imported successfully',
        ]);
    }
}
