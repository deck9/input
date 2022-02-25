<?php

use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormBlockController;
use App\Http\Controllers\Api\FormAvatarController;
use App\Http\Controllers\Api\FormResultsController;
use App\Http\Controllers\Api\PublishFormController;
use App\Http\Controllers\Api\UnpublishFormController;
use App\Http\Controllers\Api\FormBlockSequenceController;
use App\Http\Controllers\Api\InteractionResultsController;
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

    // Form Results Routes
    $router->get('results/{uuid}', [FormResultsController::class, 'show'])->name('api.forms.results.show');

    // Single Interaction Responses
    $router->get('interactions/{interaction}/responses', [InteractionResultsController::class, 'show'])->name('api.interactions.results.show');

    // Block API Routes
    $router->get('forms/{form}/blocks', [FormBlockController::class, 'index'])->name('api.blocks.index');
    $router->post('forms/{form}/blocks', [FormBlockController::class, 'create'])->name('api.blocks.create');
    $router->post('forms/blocks/{block}', [FormBlockController::class, 'update'])->name('api.blocks.update');
    $router->delete('forms/blocks/{block}', [FormBlockController::class, 'delete'])->name('api.blocks.delete');

    // Block Sequence API Routes
    $router->post('forms/{form}/blocks/sequence', FormBlockSequenceController::class)->name('api.blocks.sequence');

    // Interaction API Routes
    $router->post('{block}/interactions', [FormBlockInteractionController::class, 'create'])->name('api.interactions.create');
    $router->post('interactions/{interaction}', [FormBlockInteractionController::class, 'update'])->name('api.interactions.update');
    $router->delete('interactions/{interaction}', [FormBlockInteractionController::class, 'delete'])->name('api.interactions.delete');

    // Interaction Sequence API Routes
    $router->post('{block}/interactions/sequence', FormBlockInteractionSequenceController::class)->name('api.interactions.sequence');
});
