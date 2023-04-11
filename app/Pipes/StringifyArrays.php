<?php

namespace App\Pipes;

use Closure;

class StringifyArrays
{
    public function __invoke($content, Closure $next)
    {
        $content = collect($content)->map(function ($value) {
            if (is_array($value)) {
                return json_encode($value);
            }

            return $value;
        })->toArray();

        return $next($content);
    }
}
