<?php

use App\Http\Controllers\FormController;
use App\Http\Controllers\MetaPreviewController;
use App\Http\Controllers\ViewFormController;
use Inertia\Inertia;
use Illuminate\Routing\Router;

$router->middleware(['auth:sanctum', 'verified'])->group(function (Router $router) {
    $router->get('/', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    $router->get('forms/{uuid}/edit', [FormController::class, 'edit'])->name('forms.edit');
});

$router->get('/internal/meta-preview/{id}', [MetaPreviewController::class, 'show'])->name('internal.meta-preview');
$router->get('/{uuid}', [ViewFormController::class, 'show'])->name('forms.show');
