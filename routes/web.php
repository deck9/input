<?php

use Illuminate\Routing\Router;
use App\Http\Controllers\FormEditController;
use App\Http\Controllers\ViewFormController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FormResultsController;
use App\Http\Controllers\MetaPreviewController;
use App\Http\Controllers\FormSettingsController;
use App\Http\Controllers\ImageController;

$router->middleware(['auth:sanctum', 'verified'])->group(function (Router $router) {
    $router->get('/', [DashboardController::class, 'show'])->name('dashboard');

    $router->get('forms/{uuid}/edit', [FormEditController::class, 'show'])->name('forms.edit');
    $router->get('forms/{uuid}/settings', [FormSettingsController::class, 'show'])->name('forms.settings');
    $router->get('forms/{uuid}/results', [FormResultsController::class, 'show'])->name('forms.results');
});

$router->get('/images/{path}', [ImageController::class, 'show'])->where('path', '.*')->name('images.show');
$router->get('/internal/meta-preview/{id}', [MetaPreviewController::class, 'show'])->name('internal.meta-preview');
$router->get('/{uuid}', [ViewFormController::class, 'show'])->name('forms.show');
