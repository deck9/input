<?php

namespace App\Providers;

use App\Models\FormBlockInteraction;
use App\Models\Team;
use App\Policies\FormBlockInteractionPolicy;
use App\Policies\FormBlockPolicy;
use App\Policies\FormPolicy;
use App\Policies\TeamPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Team::class => TeamPolicy::class,
        Form::class => FormPolicy::class,
        FormBlock::class => FormBlockPolicy::class,
        FormBlockInteraction::class => FormBlockInteractionPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
