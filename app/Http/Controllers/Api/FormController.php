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
            'has_data_privacy' => false,
            'brand_color' => Form::DEFAULT_BRAND_COLOR,
        ]);

        return response()->json($form, 200);
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

    public function delete(Form $form)
    {
        $this->authorize('delete', $form);

        $form->delete();

        return response()->json(null, 200);
    }
}
