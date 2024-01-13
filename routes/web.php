<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FormDownloadTemplateController;
use App\Http\Controllers\FormEditController;
use App\Http\Controllers\FormIntegrationsController;
use App\Http\Controllers\FormSettingsController;
use App\Http\Controllers\FormSubmissionsController;
use App\Http\Controllers\FormSubmissionsExportController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MetaPreviewController;
use App\Http\Controllers\MissingTeamController;
use App\Http\Controllers\ViewFormController;
use Illuminate\Routing\Router;

$router->middleware(['auth:sanctum', 'verified'])->group(function (Router $router) {
    $router->get('/', [DashboardController::class, 'show'])->name('dashboard');

    $router->get('forms/{uuid}/edit', [FormEditController::class, 'show'])->name('forms.edit');
    $router->get('forms/{uuid}/settings', [FormSettingsController::class, 'show'])->name('forms.settings');
    $router->get('forms/{uuid}/submissions', [FormSubmissionsController::class, 'show'])->name('forms.submissions');
    $router->get('forms/{uuid}/integrations', [FormIntegrationsController::class, 'show'])->name('forms.integrations');

    // Form Template Download
    $router->get('forms/{form}/template-export', FormDownloadTemplateController::class)->name('forms.template-download');

    // Form Submissions Export Routes
    $router->get('forms/{form}/submissions-export', FormSubmissionsExportController::class)->name('forms.submissions-export');

    $router->get('team-missing', MissingTeamController::class)->name('teams.missing');
});

$router->get('/images/{path}', [ImageController::class, 'show'])->where('path', '.*')->name('images.show');
$router->get('/internal/meta-preview/{id}', [MetaPreviewController::class, 'show'])->name('internal.meta-preview');
$router->get('/{uuid}', [ViewFormController::class, 'show'])->name('forms.show');
