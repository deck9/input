<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ViewFormController extends Controller
{
    public function show($uuid)
    {
        $form = Form::withUuid($uuid)->firstOrFail();

        return response()->view('form', [
            'form' => $form,
        ]);
    }
}
