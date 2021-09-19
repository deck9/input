<?php

use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormAvatarController;
use App\Http\Controllers\Api\FormResultsController;
use App\Http\Controllers\Api\InteractionResultsController;
use App\Http\Controllers\Api\PublishFormController;

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

    // Chatbot API Routes
    $router->post('chatbots', [FormController::class, 'create'])->name('api.forms.create');
    $router->get('forms/{uuid}', [FormController::class, 'show'])->name('api.forms.show');
    $router->post('forms/{uuid}', [FormController::class, 'update'])->name('api.forms.update');
    $router->delete('forms/{uuid}', [FormController::class, 'delete'])->name('api.forms.delete');

    // Chatbot Publishing Routes
    $router->post('chatbots/{uuid}/publish', [PublishFormController::class, 'create'])->name('api.forms.publish.create');
    $router->delete('chatbots/{uuid}/publish', [PublishFormController::class, 'delete'])->name('api.forms.publish.delete');

    // Chatbot Avatar API Routes
    $router->post('chatbots/{uuid}/avatar', [FormAvatarController::class, 'store'])->name('api.forms.avatars.store');
    $router->delete('chatbots/{uuid}/avatar', [FormAvatarController::class, 'delete'])->name('api.forms.avatars.delete');

    // Chatbot Results API Routes
    $router->get('results/{uuid}', [FormResultsController::class, 'show'])->name('api.forms.results.show');

    // Interaction Responses
    $router->get('interactions/{interaction}/responses', [InteractionResultsController::class, 'show'])->name('api.interactions.results.show');

    // Snippet API Routes
    $router->get('chatbots/{chatbot}/snippets', 'SnippetController@index')->name('snippets.index');
    $router->post('chatbots/{chatbot}/snippets', 'SnippetController@create')->name('snippets.create');
    $router->post('snippets/{snippet}', 'SnippetController@update')->name('snippets.update');
    $router->delete('snippet/{snippet}', 'SnippetController@delete')->name('snippets.delete');

    // Snippet Sequence API Routes
    $router->post('chatbots/{chatbot}/snippets/sequence', 'SnippetSequenceController@update')->name('snippets.sequence.update');

    // Interaction API Routes
    $router->post('{snippet}/interactions', 'InteractionController@create')->name('interactions.create');
    $router->post('interactions/{interaction}', 'InteractionController@update')->name('interactions.update');
    $router->delete('interactions/{interaction}', 'InteractionController@delete')->name('interactions.delete');
});
