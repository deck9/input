<?php

namespace App\Http\Controllers;

use App\GlideCache;

class ImageController extends Controller
{
    public function show($path)
    {
        $server = with(new GlideCache)->getServer();

        return $server->getImageResponse($path, request()->all());
    }
}
