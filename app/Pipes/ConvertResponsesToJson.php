<?php

namespace App\Pipes;

use Closure;

class ConvertResponsesToJson
{
    public function __invoke($content, Closure $next)
    {
        if (array_key_exists('responses', $content) && is_array($content['responses'])) {
            $content['responses'] = json_encode($content['responses']);
        }

        return $next($content);
    }
}
