<?php

use App\Http\Controllers\FormController;
use Inertia\Inertia;
use Illuminate\Routing\Router;

$router->middleware(['auth:sanctum', 'verified'])->group(function (Router $router) {
    $router->get('/', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    $router->get('forms/{uuid}/edit', [FormController::class, 'edit'])->name('forms.edit');
});

$router->get('/{uuid}', 'ViewChatbotController@show')->name('forms.show');
