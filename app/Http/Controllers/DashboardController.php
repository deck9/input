<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function show(Request $request)
    {
        $request->validate([
            'filter' => 'in:published,unpublished,trashed',
        ]);

        $forms = $request->user()->forms()->withFilter($request->filter ?? null)->get();

        return Inertia::render('Dashboard', [
            'initialForms' => $forms,
        ]);
    }
}
