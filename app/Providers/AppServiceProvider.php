<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
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
