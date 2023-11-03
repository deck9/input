<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function show(Request $request)
    {
        $forms = $request->user()->forms;

        return Inertia::render('Dashboard', [
            'initialForms' => $forms,
        ]);
    }
}
