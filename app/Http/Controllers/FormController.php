<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class FormController extends Controller
{
    public function edit(Request $request, string $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        return Inertia::render('Forms/Edit', [
            'form' => $form,
        ]);
    }
}
