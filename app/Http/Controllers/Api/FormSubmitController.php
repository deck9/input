<?php

namespace App\Http\Controllers\Api;

use App\Events\FormSessionCompletedEvent;
use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSession;
use App\Rules\AnswerFitsColumn;
use Illuminate\Http\Request;
use Knuckles\Scribe\Attributes\BodyParam;
use Knuckles\Scribe\Attributes\Group;

class FormSubmitController extends Controller
{
    /**
     * Submit a form
     *
     * This endpoint submits a form. It requires a valid session token, which can be obtained by creating a new session. Using the same token will result in the old submitted data being overwritten.
     */
    #[BodyParam('token', 'string', 'The session token, or `preview` for a preview session', example: 'rIt8id8JgiyExtmb2hkcbuWjI9izUyRp')]
    #[BodyParam('payload', 'object', <<<'DESC'
    The user input that you want to submit for the form. The payload is a key-value object, where the key is the form block ID and the value is the user input for this form block.

    For form blocks that have only one input field, you submit one payload-object with the keys "payload" and "actionId". The payload is the user input and the actionId is the ID of the form block interaction field.

    For checkbox and consent questions, the payload is an array of payload-objects, one for each ticked choice or policy. A single choice question sends one payload-object for the picked choice.
    DESC, example: [
        '7j' => ['payload' => 'Secret', 'actionId' => '59R'],
        '4x1' => ['payload' => 'mail@example.com', 'actionId' => 'pQ6'],
        // For checkbox questions, the payload is an array of the ticked choices
        '5yB' => [
            ['payload' => 'Pineapple', 'actionId' => 'qYr'],
            ['payload' => 'Cherry', 'actionId' => 'vor'],
        ],
    ])]
    #[Group('Public Form Endpoints')]
    public function __invoke(Request $request, Form $form)
    {
        $request->validate([
            'token' => 'required|string',
            'is_uploading' => 'boolean',
            'payload' => 'array|nullable|max:'.$form->formBlocks()->count(),
            'payload.*' => [new AnswerFitsColumn],
        ]);

        // a preview stores and sends nothing, see CreateFormSessionController
        if ($request->input('token') === FormSession::PREVIEW_TOKEN) {
            $this->authorize('view', $form);

            return response()->noContent();
        }

        $session = $form->formSessions()
            ->where('token', $request->input('token'))
            ->firstOrFail();

        if (!is_null($request->payload)) {
            $session->submit($request->input('payload'));
        }

        if (!$request->input('is_uploading', false)) {
            event(new FormSessionCompletedEvent($session));
        }

        return response()->json($session->setHidden(['form']), 200);
    }
}
