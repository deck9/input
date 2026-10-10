<?php

namespace App\Http\Requests;

use App\Enums\FormBlockType;
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

        // same link rule as FormController::update()
        $link = ['nullable', 'regex:~^(https?://|mailto:)~i'];

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
            // same as the sequence API, a group stays at the top level
            'blocks.*.parent_block' => 'prohibited_if:blocks.*.type,'.FormBlockType::group->value,
            'is_auto_delete_enabled' => 'boolean',
            'data_retention_days' => [Rule::excludeIf(! $autoDelete), 'required_with:is_auto_delete_enabled', 'integer', 'min:1'],
            ...$logicRules->all(),
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

        // same group check as FormBlockLogicRequest, children point to their group by its template id
        $blocks = collect($template['blocks']);

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
