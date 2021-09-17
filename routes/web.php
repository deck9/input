<?php

use Inertia\Inertia;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;


Route::middleware(['auth:sanctum', 'verified'])->group(function (Router $router) {
    $router->get('/', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});
