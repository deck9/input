<?php

namespace App\Http\Requests;

use App\Enums\FormBlockType;
use App\Models\FormBlock;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class FormBlockLogicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->block());
    }

    protected function block(): FormBlock
    {
        return $this->route('block') ?? $this->route('logic')->formBlock;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'conditions' => 'required|array',
            'conditions.*.source' => 'required|string',
            'conditions.*.operator' => 'required|string|in:equals,equalsNot,contains,containsNot,isLowerThan,isGreaterThan',
            'conditions.*.value' => 'required|string',
            'conditions.*.chainOperator' => 'required|string|in:and,or',
            'action' => 'required|string|in:hide,show,goto',
            'action_payload' => 'nullable|string',
            'evaluate' => 'required|string|in:before,after',
        ];
    }

    // like the editor: a rule on a group can't use the questions inside it
    public function after(): array
    {
        return [function (Validator $validator) {
            $block = $this->block();

            if ($block->type !== FormBlockType::group) {
                return;
            }

            $inside = FormBlock::where('parent_block', $block->uuid)->pluck('uuid');

            foreach ((array) $this->input('conditions') as $pos => $condition) {
                if ($inside->contains($condition['source'] ?? null)) {
                    $validator->errors()->add("conditions.$pos.source", 'A rule on a group can only use questions outside that group.');
                }
            }
        }];
    }

    public function messages()
    {
        return [
            'name.required' => 'Give the rule a name.',
            'conditions.required' => 'Add at least one condition.',
            'conditions.*.source.required' => 'Pick a question for condition :position.',
            'conditions.*.value.required' => 'Enter a value for condition :position.',
            'conditions.*.operator.required' => 'Pick how to compare in condition :position.',
            'conditions.*.chainOperator.required' => 'Pick "and" or "or" for condition :position.',
            'action.required' => 'Pick what the rule does: hide, show or go to.',
            'evaluate.required' => 'Pick when the rule runs: before or after the question.',
        ];
    }
}
