<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FormSubmissionsController extends Controller
{
    public function __invoke(Request $request, string $uuid)
    {
        $form = $request->user()
            ->forms()
            ->withUuid($uuid)
            ->firstOrFail();

        dd($form);
    }
}
