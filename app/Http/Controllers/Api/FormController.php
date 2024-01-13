<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Endpoint;
use Knuckles\Scribe\Attributes\Group;

#[Group('Forms')]
#[Authenticated]
class FormController extends Controller
{
    /**
     * List all forms
     *
     * This endpoint returns all forms of the authenticated user.
     */
    public function index(Request $request)
    {
        $request->validate([
            'filter' => 'in:published,unpublished,trashed',
        ]);

        $forms = $request->user()
            ->currentTeam
            ->forms()
            ->withFilter($request->filter ?? null)
            ->get();

        return response()->json($forms);
    }

    /**
     * Create a new form
     *
     * This endpoint creates a new form for the authenticated user.
     */
    public function create(Request $request)
    {
        $form = Form::create([
            'name' => 'Untitled Form',
            'user_id' => $request->user()->id,
            'team_id' => $request->user()->currentTeam->id,
            'has_data_privacy' => false,
            'brand_color' => Form::DEFAULT_BRAND_COLOR,
        ]);

        return response()->json($form);
    }

    /**
     * Get a form
     *
     * This endpoint returns all meta data of a form, like title, description and settings.
     */
    public function show(Request $request, Form $form)
    {
        $this->authorize('view', $form);

        if ($request->user()->cannot('view', $form)) {
            abort(403);
        }

        return response()->json($form);
    }

    /**
     * Update a form
     *
     * This endpoint can update the forms basic data, like title, description and settings
     */
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
                'use_brighter_inputs',
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

    /**
     * Delete a form
     *
     * This endpoint soft deletes a form and all its data. When a form is deleted, it can be restored within 30 days.
     */
    public function delete(Form $form)
    {
        $this->authorize('delete', $form);

        $form->delete();

        return response()->json(null, 200);
    }
}
