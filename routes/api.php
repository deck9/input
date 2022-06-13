<?php

use Tightenco\Ziggy\Ziggy;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\ShowFormController;
use App\Http\Controllers\Api\FormBlockController;
use App\Http\Controllers\Api\FormAvatarController;
use App\Http\Controllers\Api\FormSubmitController;
use App\Http\Controllers\Api\PublishFormController;
use App\Http\Controllers\Api\UnpublishFormController;
use App\Http\Controllers\Api\FormBlockMappingController;
use App\Http\Controllers\Api\PurgeFormResultsController;
use App\Http\Controllers\Api\CreateFormSessionController;
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

$router->get('public/forms/{form}/storyboard', GetFormStoryboardController::class)->name('api.public.forms.storyboard');
$router->post('public/forms/{form}/session', CreateFormSessionController::class)->name('api.public.forms.session.create');
$router->get('public/forms/{form}', ShowFormController::class)->name('api.public.forms.show');
$router->post('public/forms/{form}', FormSubmitController::class)->name('api.public.forms.submit');

$router->get('routes', fn () => response()->json(new Ziggy)->header('Cache-Control', 'max-age=360'));

$router->middleware(['auth:sanctum'])->group(function (Router $router) {

    // Form Routes
    $router->post('forms', [FormController::class, 'create'])->name('api.forms.create');
    $router->get('forms/{form}', [FormController::class, 'show'])->name('api.forms.show');
    $router->post('forms/{form}', [FormController::class, 'update'])->name('api.forms.update');
    $router->delete('forms/{form}', [FormController::class, 'delete'])->name('api.forms.delete');

    // Form Publishing Routes
    $router->post('forms/{form}/publish', PublishFormController::class)->name('api.forms.publish');
    $router->post('forms/{form}/unpublish', UnpublishFormController::class)->name('api.forms.unpublish');

    // Form Avatar Routes
    $router->post('forms/{form}/avatar', [FormAvatarController::class, 'store'])->name('api.forms.images.store');
    $router->delete('forms/{form}/avatar', [FormAvatarController::class, 'delete'])->name('api.forms.images.delete');

    // Block API Routes
    $router->get('{form}/blocks', [FormBlockController::class, 'index'])->name('api.blocks.index');
    $router->post('{form}/blocks', [FormBlockController::class, 'create'])->name('api.blocks.create');
    $router->post('blocks/{block}', [FormBlockController::class, 'update'])->name('api.blocks.update');
    $router->delete('blocks/{block}', [FormBlockController::class, 'delete'])->name('api.blocks.delete');

    // Interaction API Routes
    $router->post('{block}/interactions', [FormBlockInteractionController::class, 'create'])->name('api.interactions.create');
    $router->post('interactions/{interaction}', [FormBlockInteractionController::class, 'update'])->name('api.interactions.update');
    $router->delete('interactions/{interaction}', [FormBlockInteractionController::class, 'delete'])->name('api.interactions.delete');

    // Sequence Routes
    $router->post('{form}/blocks/sequence', FormBlockSequenceController::class)->name('api.blocks.sequence');
    $router->post('{block}/interactions/sequence', FormBlockInteractionSequenceController::class)->name('api.interactions.sequence');

    // Template API Routes
    $router->get('forms/{form}/template-export', FormTemplateExportController::class)->name('api.forms.template-export');
    $router->post('forms/{form}/template-import', FormTemplateImportController::class)->name('api.forms.template-import');

    // Form Results API Routes
    $router->post('forms/{form}/purge-results', PurgeFormResultsController::class)->name('api.forms.purge-results');

    // Form Block Mapping is just a helper to discover block & interaction type matches
    $router->get('form-blocks/mapping', FormBlockMappingController::class)->name('api.form-blocks.mapping');
});
