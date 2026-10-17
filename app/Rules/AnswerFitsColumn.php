<?php

namespace App\Rules;

use App\Models\FormSessionResponse;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AnswerFitsColumn implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($this->tooLong($value)) {
            $fail('This answer is too long. Please shorten it and send it again.');
        }
    }

    // walks lists at any depth, the way FormBlock::submit does
    private function tooLong(mixed $value): bool
    {
        if (! is_array($value)) {
            return false;
        }

        if (has_string_keys($value)) {
            // measured the way it is stored: encrypted, or as JSON in debug mode
            return strlen(FormSessionResponse::toStored($value['payload'] ?? null)) > FormSessionResponse::VALUE_MAX_BYTES;
        }

        return collect($value)->contains(fn ($answer) => $this->tooLong($answer));
    }
}
