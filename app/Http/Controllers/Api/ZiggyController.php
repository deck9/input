<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Knuckles\Scribe\Attributes\Endpoint;
use Knuckles\Scribe\Attributes\Group;
use Knuckles\Scribe\Attributes\Unauthenticated;
use Tightenco\Ziggy\Ziggy;

class ZiggyController extends Controller
{
    #[Endpoint("Get the ziggy routes", <<<DESC
    This endpoint returns the routes used in the Ziggy package.
    DESC)]
    #[Group("Ziggy Routes")]
    #[Unauthenticated]
    public function __invoke()
    {
        return response()->json(new Ziggy)
            ->header('Cache-Control', 'max-age=360');
    }
}
