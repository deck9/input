<?php

namespace App\Http\Controllers\Api;

use App\Models\Form;
use App\NameFactory;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FormController extends Controller
{
    public function create(Request $request)
    {
        $form = Form::create([
            'name' => NameFactory::generate(),
            'user_id' => $request->user()->id,
            'brand_color' => Form::DEFAULT_BRAND_COLOR,
            'has_data_privacy' => false,
        ]);

        $form->createDefaultConsent();

        return response()->json($form, 200);
    }

    public function show(Request $request, String $uuid)
    {
        $form = $request
            ->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        if ($request->user()->cannot('view', $form)) {
            abort(403);
        }

        return response()->json($form);
    }

    public function update(Request $request, $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        if ($request->user()->cannot('update', $form)) {
            abort(403);
        }

        $form->update(
            $request->only(
                'name',
                'description',
                'is_notification_via_mail',
                'brand_color',
                'message_background_color',
                'message_text_color',
                'user_message_background_color',
                'user_message_text_color',
                'interaction_background_color',
                'interaction_text_color',
                'cta_link',
                'cta_label',
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
                'show_cta_link',
                'show_social_links',
            )
        );

        return response()->json($form, 200);
    }

    public function delete(Request $request, $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        if ($request->user()->cannot('delete', $form)) {
            abort(403);
        }

        $form->delete();

        return response()->json(null, 200);
    }
}
