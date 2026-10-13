<?php

namespace App\Http\Requests;

use App\Enums\FormBlockType;
use App\Models\FormBlock;
use Closure;
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

    // null while Scribe reads the rules without a route
    protected function block(): ?FormBlock
    {
        return $this->route('block') ?? $this->route('logic')?->formBlock;
    }

    // the template import reuses these rules without a block, and drops a rule that points to a missing block itself
    protected function inThisForm(string $message, bool $when = true): Closure
    {
        /** The `uuid` of a block of this form. */
        return function (string $attribute, mixed $value, Closure $fail) use ($message, $when) {
            if ($when && $this->block() && ! $this->block()->form->formBlocks->pluck('uuid')->containsStrict($value)) {
                $fail($message);
            }
        };
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
            'conditions.*.source' => ['required', 'string', $this->inThisForm('The question of your #:position condition is not in this form.')],
            'conditions.*.operator' => 'required|string|in:equals,equalsNot,contains,containsNot,isLowerThan,isGreaterThan',
            'conditions.*.value' => 'required|string',
            'conditions.*.chainOperator' => 'required|string|in:and,or',
            'action' => 'required|string|in:hide,show,goto',
            // only a goto rule uses its payload, a hide or show rule can keep an old target from the editor
            'action_payload' => ['nullable', 'string', $this->inThisForm('The question to go to is not in this form.', when: $this->input('action') === 'goto')],
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
            'conditions.*.value.required' => 'Add an answer for condition :position.',
            'conditions.*.operator.required' => 'Pick how to compare in condition :position.',
            'conditions.*.chainOperator.required' => 'Pick "and" or "or" for condition :position.',
            'action.required' => 'Pick what the rule does: hide, show or go to.',
            'evaluate.required' => 'Pick when the rule runs: before or after the question.',
        ];
    }
}
