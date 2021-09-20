<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\NameFactory;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

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
