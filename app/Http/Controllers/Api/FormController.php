<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;

class FormController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'filter' => 'in:published,unpublished,trashed',
        ]);

        $forms = $request->user()
            ->forms()
            ->withFilter($request->filter ?? null)
            ->get();

        return response()->json($forms);
    }

    public function create(Request $request)
    {
        $form = Form::create([
            'name' => 'Untitled Form',
            'user_id' => $request->user()->id,
            'has_data_privacy' => false,
            'brand_color' => Form::DEFAULT_BRAND_COLOR,
        ]);

        return response()->json($form);
    }

    public function show(Request $request, Form $form)
    {
        $this->authorize('view', $form);

        if ($request->user()->cannot('view', $form)) {
            abort(403);
        }

        return response()->json($form);
    }

    public function update(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $request->validate([
            'is_auto_delete_enabled' => 'boolean',
            'data_retention_days' => 'required_if:is_auto_delete_enabled,true',
        ]);

        $form->update(
            $request->only(
                'name',
                'description',
                'language',
                'is_notification_via_mail',
                'brand_color',
                'background_color',
                'text_color',
                'message_background_color',
                'message_text_color',
                'user_message_background_color',
                'user_message_text_color',
                'interaction_background_color',
                'interaction_text_color',
                'show_form_progress',
                'cta_link',
                'cta_label',
                'cta_append_params',
                'cta_append_session_id',
                'use_cta_redirect',
                'cta_redirect_delay',
                'eoc_headline',
                'eoc_text',
                'twitter',
                'facebook',
                'instagram',
                'github',
                'linkedin',
                'has_data_privacy',
                'privacy_link',
                'legal_notice_link',
                'data_retention_days',
                'is_auto_delete_enabled',
                'show_cta_link',
                'show_social_links',
            )
        );

        return response()->json($form, 200);
    }

    public function delete(Form $form)
    {
        $this->authorize('delete', $form);

        $form->delete();

        return response()->json(null, 200);
    }
}
