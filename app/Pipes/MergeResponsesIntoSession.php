<?php

namespace App\Pipes;

use Closure;

class MergeResponsesIntoSession
{
    public function __invoke($content, Closure $next)
    {
        $responses = $content['responses']
            ->map(function ($response) {
                $concat = join(', ', $response->pluck('value')->sortBy('value')->all());

                return [
                    'answer' => $concat,
                    'data' => $response->toArray(),
                ];
            })->toArray();


        $content['responses'] = $responses;

        return $next($content);
    }
}
