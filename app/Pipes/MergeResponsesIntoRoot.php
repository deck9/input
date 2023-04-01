<?php

namespace App\Pipes;

use Closure;

class MergeResponsesIntoRoot
{
    public function __invoke($content, Closure $next)
    {
        $content['responses']
            ->each(function ($response, $key) use (&$content) {
                $content[$key] = $response['answer'];
            });

        return $next($content);
    }
}
