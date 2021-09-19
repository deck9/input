<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class ViewFormController extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('Form/Show', []);
    }
}
