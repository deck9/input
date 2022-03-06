<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ViewFormController extends Controller
{
    public function show(Request $request, $uuid)
    {
        $form = Form::where('uuid', $uuid)->firstOrFail();
        return Inertia::render('Forms/Show', ['form' => $form]);
    }
}
