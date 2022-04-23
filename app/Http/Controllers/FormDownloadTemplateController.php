<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class FormDownloadTemplateController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('view', $form);

        return response()->streamDownload(function () use ($form) {
            echo json_encode($form->toTemplate());
        }, Str::slug($form->name) . ".template.json");
    }
}
