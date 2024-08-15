<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\NoPrivateNetworkHttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            HttpClientInterface::class,
            function ($app) {
                return new NoPrivateNetworkHttpClient(HttpClient::create([
                    'headers' => [
                        'user-agent' => 'Input-App/1.0',
                    ],
                ]));
            }
        );

        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        JsonResource::withoutWrapping();

        Builder::macro('withUuid', function ($id) {
            // if we are in a test environment using sqlite, we cannot use BINARY operator
            if (config('database.default') === 'sqlite') {
                return $this->where('uuid', '=', $id);
            } else {
                return $this->where(DB::raw('BINARY `uuid`'), $id);
            }
        });
    }
}
