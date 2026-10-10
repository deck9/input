<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MaxSize implements ValidationRule
{
    public function __construct(private int $bytes, private bool $json = false)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // measured the way the value is stored, so a cap maps to the stored size:
        // answers are encrypted serialized, session params are cast to JSON
        $stored = $this->json ? json_encode($value) : serialize($value);

        if (strlen($stored) > $this->bytes) {
            $fail("The :attribute may not be larger than {$this->bytes} bytes.");
        }
    }
}
