<?php

namespace App;

use League\Glide\ServerFactory;
use Illuminate\Support\Facades\Storage;
use League\Glide\Responses\LaravelResponseFactory;

class GlideCache
{
    public function clear($path)
    {
        if (!$path) {
            return;
        }

        $server = ServerFactory::create([
            'response' => new LaravelResponseFactory(app('request')),
            'source' => Storage::disk('avatars')->getDriver(),
            'cache' => Storage::getDriver(),
            'cache_path_prefix' => '.cache',
            'base_url' => 'avatars',
        ]);

        $server->deleteCache($path);
    }
}
