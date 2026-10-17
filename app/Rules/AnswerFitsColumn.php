<?php

namespace App\Rules;

use App\Models\FormSessionResponse;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AnswerFitsColumn implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // a block sends one answer, or a list of answers (checkbox, consent)
        $answers = is_array($value) && ! has_string_keys($value) ? $value : [$value];

        foreach ($answers as $answer) {
            // measured the way it is stored: encrypted, or as JSON in debug mode
            if (is_array($answer) && strlen(FormSessionResponse::toStored($answer['payload'] ?? null)) > FormSessionResponse::VALUE_MAX_BYTES) {
                $fail('This answer is too long. Please shorten it and send it again.');

                return;
            }
        }
    }
}
