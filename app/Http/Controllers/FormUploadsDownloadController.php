<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FormSessionUpload;
use Illuminate\Support\Facades\Storage;

class FormUploadsDownloadController extends Controller
{
    public function __invoke(Request $request, $upload)
    {
        $upload = FormSessionUpload::whereUuid($upload)->firstOrFail();

        return Storage::download($upload->path, $upload->name);
    }
}
