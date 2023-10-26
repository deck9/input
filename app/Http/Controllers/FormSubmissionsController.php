<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class FormSubmissionsController extends Controller
{
    public function show(Request $request, string $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        return Inertia::render('Forms/Submissions', [
            'form' => $form,
        ]);
    }
}
