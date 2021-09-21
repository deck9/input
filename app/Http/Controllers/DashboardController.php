<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function show(Request $request)
    {
        $forms = $request->user()->forms;

        return Inertia::render('Dashboard', [
            'forms' => $forms,
        ]);
    }
}
