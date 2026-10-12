<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;
use Knuckles\Scribe\Attributes\QueryParam;

#[Group('Forms')]
#[Authenticated]
class FormController extends Controller
{
    /**
     * List all forms
     *
     * This endpoint returns all forms of the authenticated user.
     */
    #[QueryParam('filter', 'string', 'Only published, unpublished or trashed forms. Any other value lists all forms that are not trashed.', false, enum: ['published', 'unpublished', 'trashed'])]
    #[QueryParam('sort', 'string', 'name, created_at, updated_at or latest_submission_at, with :asc or :desc. Any other value keeps the default order.', false, example: 'latest_submission_at:desc')]
    public function index(Request $request)
    {
        $filter = $request->query('filter');
        $sort = $request->query('sort');

        // unknown values fall back to the default list, so old links keep working
        $forms = $request->user()
            ->currentTeam
            ->forms()
            ->withMax('formSessions as latest_submission_at', 'is_completed')
            ->withFilter(is_string($filter) ? $filter : null)
            ->withOrder(is_string($sort) ? $sort : null)
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
        $request->validate(['name' => 'nullable|string|max:255']);

        $form = Form::create([
            'name' => $request->name ?? 'Untitled Form',
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

        // the settings pages send the whole form back on save, so only check a changed value
        $changed = fn (string $key, string ...$rules) => [
            Rule::excludeIf($request->input($key) === $form->$key),
            ...$rules,
        ];
        $link = fn (string $key) => $changed($key, 'nullable', 'max:255', 'regex:~^(https?://|mailto:)~i');
        $color = fn (string $key) => $changed($key, 'nullable', 'string', 'max:32');

        $request->validate([
            'name' => $changed('name', 'filled', 'string', 'max:255'),
            'description' => $changed('description', 'nullable', 'string', 'max:1024'),
            'language' => $changed('language', 'nullable', 'string', 'max:4'),
            'brand_color' => $changed('brand_color', 'nullable', 'string', 'max:255'),
            'background_color' => $color('background_color'),
            'text_color' => $color('text_color'),
            'message_background_color' => $color('message_background_color'),
            'message_text_color' => $color('message_text_color'),
            'user_message_background_color' => $color('user_message_background_color'),
            'user_message_text_color' => $color('user_message_text_color'),
            'interaction_background_color' => $color('interaction_background_color'),
            'interaction_text_color' => $color('interaction_text_color'),
            'cta_label' => $changed('cta_label', 'nullable', 'string', 'max:255'),
            'eoc_headline' => $changed('eoc_headline', 'nullable', 'string', 'max:255'),
            'is_auto_delete_enabled' => 'boolean',
            // checked against the value the form ends up with; the settings page also sends the hidden field while auto delete is off
            'data_retention_days' => [
                Rule::excludeIf(! $request->boolean('is_auto_delete_enabled', $form->is_auto_delete_enabled)),
                'required_with:is_auto_delete_enabled',
                'integer',
                'min:1',
            ],
            'cta_link' => $link('cta_link'),
            'privacy_link' => $link('privacy_link'),
            'legal_notice_link' => $link('legal_notice_link'),
            'twitter' => $link('twitter'),
            'facebook' => $link('facebook'),
            'instagram' => $link('instagram'),
            'github' => $link('github'),
            'linkedin' => $link('linkedin'),
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
