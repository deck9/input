<?php

namespace App\Providers;

use App\Events\FormPublished;
use App\Listeners\CreatePreviewImage;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use App\Events\FormSessionCompletedEvent;
use App\Listeners\FormSubmitWebhookListener;
use App\Listeners\FormSessionNotificationListener;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        FormPublished::class => [
            // CreatePreviewImage::class,
        ],

        FormSessionCompletedEvent::class => [
            FormSubmitWebhookListener::class,
            FormSessionNotificationListener::class
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
