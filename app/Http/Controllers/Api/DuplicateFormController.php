<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\BodyParam;
use Knuckles\Scribe\Attributes\Group;

class DuplicateFormController extends Controller
{
    /**
     * Duplicates a form
     *
     * This endpoint duplicates a form for the authenticated user.
     */
    #[Group('Forms')]
    #[Authenticated]
    #[BodyParam('name', 'string', 'The name of the new form.', false, example: 'Copy of My Form')]
    public function __invoke(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $request->validate(['name' => 'nullable|string|max:255']);

        // a long original name must not push the copy's name past its column
        $newForm = $form->duplicate($request->name ?? Str::substr('Copy of '.$form->name, 0, 255));

        $request->user()->forms()->save($newForm);

        return response()->json($newForm, 201);
    }
}
