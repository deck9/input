<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MetaPreviewController extends Controller
{
    public function show($id)
    {
        $form = Form::find($id);
        $block = $form->blocks()->whereHas('interactions')->first();

        return Inertia::render('Form/PreviewImage', [
            'form' => $form,
            'block' => $block,
        ]);
    }
}
