<?php

use Illuminate\Routing\Router;
use App\Http\Controllers\FormController;
use App\Http\Controllers\ViewFormController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MetaPreviewController;

$router->middleware(['auth:sanctum', 'verified'])->group(function (Router $router) {
    $router->get('/', [DashboardController::class, 'show'])->name('dashboard');

    $router->get('forms/{uuid}/edit', [FormController::class, 'edit'])->name('forms.edit');
});

$router->get('/internal/meta-preview/{id}', [MetaPreviewController::class, 'show'])->name('internal.meta-preview');
$router->get('/{uuid}', [ViewFormController::class, 'show'])->name('forms.show');
