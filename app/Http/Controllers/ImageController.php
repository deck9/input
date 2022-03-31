<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use League\Glide\ServerFactory;
use Illuminate\Support\Facades\Storage;
use League\Glide\Responses\LaravelResponseFactory;

class ImageController extends Controller
{
    public function show($path)
    {
        $server = ServerFactory::create([
            'response' => new LaravelResponseFactory(app('request')),
            'source' => Storage::getDriver(),
            'cache' => Storage::getDriver(),
            'cache_path_prefix' => '.cache',
            'base_url' => 'avatars',
        ]);

        return $server->getImageResponse($path, request()->all());
    }
}
