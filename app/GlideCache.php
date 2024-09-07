<?php

namespace App;

use Illuminate\Support\Facades\Storage;
use League\Flysystem\Filesystem;
use League\Flysystem\InMemory\InMemoryFilesystemAdapter;
use League\Glide\Responses\SymfonyResponseFactory;
use League\Glide\ServerFactory;

class GlideCache
{
    public $server;

    public function __construct()
    {
        $adapter = new InMemoryFilesystemAdapter();

        $this->server = ServerFactory::create([
            'response' => new SymfonyResponseFactory(app('request')),
            'source' => Storage::getDriver(),
            'cache' => config('filesystems.default') === 'minio' ? new Filesystem($adapter) : Storage::getDriver(),
            'cache_path_prefix' => '.cache',
            'base_url' => 'images',
            'max_image_size' => 2880 * 2880,
        ]);
    }

    public function clear($path)
    {
        if (! $path) {
            return;
        }

        $this->server->deleteCache($path);
    }

    public function getServer()
    {
        return $this->server;
    }
}
