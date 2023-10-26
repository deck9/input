<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Tightenco\Ziggy\Ziggy;

class ZiggyController extends Controller
{
    public function __invoke()
    {
        return response()->json(new Ziggy)
            ->header('Cache-Control', 'max-age=360');
    }
}
