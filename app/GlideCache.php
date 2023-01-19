<?php

namespace App;

use League\Glide\ServerFactory;
use League\Flysystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use League\Glide\Responses\LaravelResponseFactory;
use League\Flysystem\InMemory\InMemoryFilesystemAdapter;

class GlideCache
{

    public $server;

    public function __construct()
    {
        $adapter = new InMemoryFilesystemAdapter();

        $this->server = ServerFactory::create([
            'response' => new LaravelResponseFactory(app('request')),
            'source' => Storage::getDriver(),
            'cache' => config('filesystems.default') === 'minio' ? new Filesystem($adapter) : Storage::getDriver(),
            'cache_path_prefix' => '.cache',
            'base_url' => 'images',
            'max_image_size' => 2880 * 2880,
        ]);
    }

    public function clear($path)
    {
        if (!$path) {
            return;
        }

        $this->server->deleteCache($path);
    }

    public function getServer()
    {
        return $this->server;
    }
}
