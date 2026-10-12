<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MaxSize implements ValidationRule
{
    public function __construct(private int $bytes, private bool $json = false, private bool $text = false) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // measured the way the value is stored, so a cap maps to the stored size:
        // answers are encrypted serialized, session params are cast to JSON, a text column takes the text as is
        $stored = match (true) {
            $this->text && is_string($value) => $value,
            $this->json => json_encode($value),
            default => serialize($value),
        };

        if (strlen($stored) > $this->bytes) {
            $fail("The :attribute may not be larger than {$this->bytes} bytes.");
        }
    }
}
