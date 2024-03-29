<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Inertia\Inertia;

class MetaPreviewController extends Controller
{
    public function show(Form $form)
    {
        $block = $form->formBlocks()
            ->whereHas('formBlockInteractions')
            ->first();

        return Inertia::render('Form/PreviewImage', [
            'form' => $form,
            'block' => $block,
        ]);
    }
}
