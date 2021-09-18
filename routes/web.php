<?php

use Inertia\Inertia;
use Illuminate\Routing\Router;

$router->middleware(['auth:sanctum', 'verified'])->group(function (Router $router) {
    $router->get('/', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});

$router->get('/{uuid}', 'ViewChatbotController@show')->name('forms.show');
