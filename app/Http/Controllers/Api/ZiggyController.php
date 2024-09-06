<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Knuckles\Scribe\Attributes\Group;
use Tighten\Ziggy\Ziggy;

class ZiggyController extends Controller
{
    /**
     * Get the ziggy routes
     *
     * This endpoint returns the routes used in the Ziggy package.
     */
    #[Group('Utilities')]
    public function __invoke()
    {
        return response()->json(new Ziggy())
            ->header('Cache-Control', 'max-age=360');
    }
}
