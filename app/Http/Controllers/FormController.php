<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\NameFactory;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class FormController extends Controller
{
    public function edit(Request $request, string $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        return Inertia::render('Forms/Edit', [
            'form' => $form,
        ]);
    }

    public function update(Request $request, $uuid)
    {
        $form = $request->user()->chatbots()->withUuid($uuid)->firstOrFail();
        Gate::authorize('update', $form);

        // update basic chatbot fields
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

        return response()->json($form->toArray(), 200);
    }

    public function delete(Request $request, $uuid)
    {
        $form = $request->user()->chatbots()->withUuid($uuid)->firstOrFail();
        Gate::authorize('update', $form);

        $form->delete();

        return response()->json('', 200);
    }
}
