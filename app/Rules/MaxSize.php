<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MaxSize implements ValidationRule
{
    public function __construct(private int $bytes)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // measured serialized, the form an answer is encrypted in, so a cap maps to the stored size
        if (strlen(serialize($value)) > $this->bytes) {
            $fail("The :attribute may not be larger than {$this->bytes} bytes.");
        }
    }
}
