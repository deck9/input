<?php

namespace App\Http\Controllers\Api;

use Tightenco\Ziggy\Ziggy;
use App\Http\Controllers\Controller;

class ZiggyController extends Controller
{
    public function __invoke()
    {
        return response()->json(new Ziggy)
            ->header('Cache-Control', 'max-age=360');
    }
}
