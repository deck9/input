<?php

use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormBlockController;
use App\Http\Controllers\Api\FormAvatarController;
use App\Http\Controllers\Api\FormSubmitController;
use App\Http\Controllers\Api\FormSessionController;
use App\Http\Controllers\Api\PublishFormController;
use App\Http\Controllers\Api\UnpublishFormController;
use App\Http\Controllers\Api\FormBlockMappingController;
use App\Http\Controllers\Api\FormBlockSequenceController;
use App\Http\Controllers\Api\GetFormStoryboardController;
use App\Http\Controllers\Api\FormTemplateExportController;
use App\Http\Controllers\Api\FormTemplateImportController;
use App\Http\Controllers\Api\FormBlockInteractionController;
use App\Http\Controllers\Api\FormBlockInteractionSequenceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

$router->get('public/forms/{uuid}/storyboard', GetFormStoryboardController::class)->name('api.public.forms.storyboard');
$router->post('public/forms/{uuid}/session', [FormSessionController::class, 'create'])->name('api.public.forms.session.create');
$router->post('public/forms/{uuid}', FormSubmitController::class)->name('api.public.forms.submit');

$router->middleware(['auth:sanctum'])->group(function (Router $router) {

    // Form Routes
    $router->post('forms', [FormController::class, 'create'])->name('api.forms.create');
    $router->get('forms/{uuid}', [FormController::class, 'show'])->name('api.forms.show');
    $router->post('forms/{uuid}', [FormController::class, 'update'])->name('api.forms.update');
    $router->delete('forms/{uuid}', [FormController::class, 'delete'])->name('api.forms.delete');

    // Form Publishing Routes
    $router->post('forms/{uuid}/publish', PublishFormController::class)->name('api.forms.publish');
    $router->post('forms/{uuid}/unpublish', UnpublishFormController::class)->name('api.forms.unpublish');

    // Form Avatar Routes
    $router->post('forms/{uuid}/avatar', [FormAvatarController::class, 'store'])->name('api.forms.images.store');
    $router->delete('forms/{uuid}/avatar', [FormAvatarController::class, 'delete'])->name('api.forms.images.delete');

    // Block API Routes
    $router->get('forms/{form}/blocks', [FormBlockController::class, 'index'])->name('api.blocks.index');
    $router->post('forms/{form}/blocks', [FormBlockController::class, 'create'])->name('api.blocks.create');
    $router->post('forms/blocks/{block}', [FormBlockController::class, 'update'])->name('api.blocks.update');
    $router->delete('forms/blocks/{block}', [FormBlockController::class, 'delete'])->name('api.blocks.delete');

    // Interaction API Routes
    $router->post('{block}/interactions', [FormBlockInteractionController::class, 'create'])->name('api.interactions.create');
    $router->post('interactions/{interaction}', [FormBlockInteractionController::class, 'update'])->name('api.interactions.update');
    $router->delete('interactions/{interaction}', [FormBlockInteractionController::class, 'delete'])->name('api.interactions.delete');

    // Additional API Routes
    $router->get('form-blocks/mapping', FormBlockMappingController::class)->name('api.form-blocks.mapping');
    $router->post('forms/{form}/blocks/sequence', FormBlockSequenceController::class)->name('api.blocks.sequence');
    $router->post('{block}/interactions/sequence', FormBlockInteractionSequenceController::class)->name('api.interactions.sequence');

    $router->get('forms/{form}/template-export', FormTemplateExportController::class)->name('api.forms.template-export');
    $router->post('forms/{form}/template-import', FormTemplateImportController::class)->name('api.forms.template-import');
});
