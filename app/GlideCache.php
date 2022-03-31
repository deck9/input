<?php

namespace App;

use League\Glide\ServerFactory;
use League\Flysystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use League\Glide\Responses\LaravelResponseFactory;
use League\Flysystem\InMemory\InMemoryFilesystemAdapter;

class GlideCache
{
    public function clear($path)
    {
        if (!$path) {
            return;
        }

        $adapter = new InMemoryFilesystemAdapter();

        $server = ServerFactory::create([
            'response' => new LaravelResponseFactory(app('request')),
            'source' => Storage::getDriver(),
            'cache' => config('filesystems.default') === 'minio' ? new Filesystem($adapter) : Storage::getDriver(),
            'cache_path_prefix' => '.cache',
            'base_url' => 'images',
        ]);

        $server->deleteCache($path);
    }
}
