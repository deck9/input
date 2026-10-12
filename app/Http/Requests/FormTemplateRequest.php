<?php

namespace App\Http\Requests;

use App\Enums\FormBlockInteractionType;
use App\Enums\FormBlockType;
use App\Rules\MaxSize;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class FormTemplateRequest extends FormRequest
{
    // importing into a form needs update on it, a new form only a logged-in user, like creating a blank one
    public function authorize(): bool
    {
        $form = $this->route('form');

        return ! $form || $this->user()->can('update', $form);
    }

    public function rules(): array
    {
        return [
            'file' => 'required_without:template|file|mimetypes:application/json',
            'template' => 'required_without:file|json',
        ];
    }

    // the checked template, for the form in the route or a new one
    public function template(): array
    {
        $template = (array) json_decode(
            $this->has('file') ? file_get_contents($this->file('file')) : $this->input('template'),
            true
        );

        // image paths point to files of the form that uploaded them, the form keeps its own
        unset($template['avatar_path'], $template['background_path']);

        // raw JSON skips the API's trim and "" → null steps, so a blank form setting gets them here and saves like the settings pages
        $template = array_map(fn ($value) => is_string($value) && trim($value) === '' ? null : $value, $template);

        // same link, length, number and yes/no rules as FormController::update()
        $link = ['nullable', 'max:255', 'regex:~^(https?://|mailto:)~i'];
        $maxInt = 'max:2147483647';

        // block and answer values skip the blank → null step above, and a blank skips every rule but "filled", so a number, yes/no or list needs it;
        // where the column takes empty (or the list may be missing), null passes and a blank doesn't
        $emptyOr = fn (string ...$rules) => Rule::forEach(fn ($value) => match (true) {
            $value === null => [],
            is_string($value) && trim($value) === '' => ['filled'],
            default => $rules,
        });

        // same rules as creating a logic rule through the API
        $logicRules = collect((new FormBlockLogicRequest())->rules())
            ->mapWithKeys(fn ($rule, $key) => ["blocks.*.formBlockLogics.*.$key" => $rule]);

        // same retention rule as FormController::update(), against the value the form ends up with
        $autoDelete = filter_var(
            $template['is_auto_delete_enabled'] ?? $this->route('form')?->is_auto_delete_enabled ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        Validator::make($template, [
            'blocks' => 'present|array',
            'blocks.*.id' => 'nullable|string',
            'blocks.*.type' => ['required', Rule::enum(FormBlockType::class)],
            'blocks.*.title' => 'nullable|string|max:1024',
            'blocks.*.message' => ['nullable', 'string', new MaxSize(65535, text: true)],
            'blocks.*.is_required' => $emptyOr('boolean'),
            'blocks.*.is_disabled' => 'filled|boolean',
            // the largest value of an unsigned integer column
            'blocks.*.sequence' => 'filled|integer|min:0|max:4294967295',
            // same as the sequence API, a group stays at the top level
            'blocks.*.parent_block' => 'prohibited_if:blocks.*.type,'.FormBlockType::group->value,
            'blocks.*.formBlockInteractions' => $emptyOr('array'),
            'blocks.*.formBlockLogics' => $emptyOr('array'),
            'blocks.*.formBlockInteractions.*.type' => ['required', Rule::enum(FormBlockInteractionType::class)],
            'blocks.*.formBlockInteractions.*.name' => 'nullable|string|max:255',
            'blocks.*.formBlockInteractions.*.label' => 'nullable|string|max:255',
            'blocks.*.formBlockInteractions.*.is_editable' => 'filled|boolean',
            'blocks.*.formBlockInteractions.*.is_disabled' => 'filled|boolean',
            'blocks.*.formBlockInteractions.*.sequence' => $emptyOr('integer', 'min:0', $maxInt),
            'is_auto_delete_enabled' => 'boolean',
            'data_retention_days' => $autoDelete
                ? ['required_with:is_auto_delete_enabled', 'integer', 'min:1', $maxInt]
                : ['nullable', 'integer', $maxInt],
            ...$logicRules->all(),
            'description' => 'nullable|string|max:1024',
            'language' => 'nullable|string|max:4',
            'brand_color' => 'nullable|string|max:255',
            'background_color' => 'nullable|string|max:32',
            'text_color' => 'nullable|string|max:32',
            'cta_label' => 'nullable|string|max:255',
            'eoc_headline' => 'nullable|string|max:255',
            'eoc_text' => ['nullable', 'string', new MaxSize(65535, text: true)],
            'cta_redirect_delay' => ['nullable', 'integer', 'min:0', $maxInt],
            'cta_append_params' => 'boolean',
            'cta_append_session_id' => 'boolean',
            'use_cta_redirect' => 'boolean',
            'show_cta_link' => 'boolean',
            'show_social_links' => 'boolean',
            'use_brighter_inputs' => 'boolean',
            'show_form_progress' => 'nullable|boolean',
            'cta_link' => $link,
            'privacy_link' => $link,
            'legal_notice_link' => $link,
            'twitter' => $link,
            'facebook' => $link,
            'instagram' => $link,
            'github' => $link,
            'linkedin' => $link,
        ], [
            'blocks.*.parent_block.prohibited_if' => 'A group can\'t go into another group.',
        ])->validate();

        $blocks = collect($template['blocks']);

        // the import only creates a block with a parent_block inside a top-level group (strict, so "" fails too, unlike Rule::in)
        $topLevelGroups = $blocks->where('type', FormBlockType::group->value)->whereNull('parent_block')->pluck('id');

        foreach ($blocks as $i => $block) {
            if (isset($block['parent_block']) && ! $topLevelGroups->containsStrict($block['parent_block'])) {
                throw ValidationException::withMessages([
                    "blocks.$i.parent_block" => 'A question can only go into a top-level group of the template.',
                ]);
            }
        }

        // same group check as FormBlockLogicRequest, children point to their group by its template id
        foreach ($blocks->where('type', FormBlockType::group->value)->whereNotNull('id') as $i => $group) {
            $inside = $blocks->whereStrict('parent_block', $group['id'])->pluck('id');

            foreach ($group['formBlockLogics'] ?? [] as $j => $logic) {
                foreach ($logic['conditions'] as $k => $condition) {
                    if ($inside->containsStrict($condition['source'])) {
                        throw ValidationException::withMessages([
                            "blocks.$i.formBlockLogics.$j.conditions.$k.source" => 'A rule on a group can only use questions outside that group.',
                        ]);
                    }
                }
            }
        }

        return $template;
    }
}
