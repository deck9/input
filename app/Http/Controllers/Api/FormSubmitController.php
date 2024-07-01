<?php

namespace App\Http\Controllers\Api;

use App\Events\FormSessionCompletedEvent;
use App\Http\Controllers\Controller;
use App\Models\Form;
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
    #[BodyParam('token', 'string', 'The session token', example: 'rIt8id8JgiyExtmb2hkcbuWjI9izUyRp')]
    #[BodyParam('payload', 'object', <<<'DESC'
    The user input that you want to submit for the form. The payload is a key-value object, where the key is the form block ID and the value is the user input for this form block.

    For form blocks that have only one input field, you submit one payload-object with the keys "payload" and "actionId". The payload is the user input and the actionId is the ID of the form block interaction field.

    For multiple choice questions, the payload is an array of payload-objects.
    DESC, example: [
        '7j' => ['payload' => 'Secret', 'actionId' => '59R'],
        '4x1' => ['payload' => 'mail@example.com', 'actionId' => 'pQ6'],
        // For multiple choice questions, the payload is an array of the selected options
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
            'payload' => 'array',
        ]);

        $session = $form->formSessions()
            ->where('token', $request->input('token'))
            ->firstOrFail()
            ->submit($request->input('payload'));

        event(new FormSessionCompletedEvent($session));

        return response()->json($session->setHidden(['form']), 200);
    }
}
