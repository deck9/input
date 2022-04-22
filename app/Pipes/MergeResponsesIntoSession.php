<?php

namespace App\Pipes;

use Closure;

class MergeResponsesIntoSession
{
    public function __invoke($content, Closure $next)
    {
        $responses = $content['responses']
            ->mapWithKeys(function ($response) {
                return [
                    $response['name'] => $response['value'],
                ];
            })->toArray();

        unset($content['responses']);
        $content = array_merge($content, $responses);

        return $next($content);
    }
}
