<?php

namespace App\Pipes;

use Closure;

class MergeResponsesIntoSession
{
    public function __invoke($content, Closure $next)
    {
        $responses = $content['responses']
            ->groupBy('name')
            ->map(function ($response) {
                return join(', ', $response->pluck('value')->sortBy('value')->all());
            })->toArray();

        $content = array_merge($content, $responses);
        $content['responses'] = json_encode($content['responses']->groupBy('name')->toArray());

        return $next($content);
    }
}
