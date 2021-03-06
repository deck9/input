<?php

namespace App\Http\Controllers\Api;

use App\GlideCache;
use App\Models\Form;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\FormAvatarRequest;

class FormAvatarController extends Controller
{
    public function store(FormAvatarRequest $request, Form $form)
    {
        $this->authorize('update', $form);

        // if old file, clear that first
        if ($form->avatar_path) {
            Storage::delete($form->avatar_path);
            with(new GlideCache)->clear($form->avatar_path);
        }

        $file = $request->file('image');

        $filename = sprintf("%s.%s.%s", strtolower(Str::random(6)), time(), $file->extension());

        // store to filesystem
        $file->storeAs($form->uuid, $filename);

        // save to form model
        $form->avatar_path = join('/', [$form->uuid, $filename]);
        $form->save();

        return response()->json($form, 201);
    }

    public function delete(Form $form)
    {
        $this->authorize('update', $form);

        // remove image from disk and cache
        if ($form->hasAvatar()) {
            Storage::delete($form->avatar_path);
            $cache = new GlideCache;
            $cache->clear($form->avatar_path);

            $form->avatar_path = null;
            $form->save();
        }


        return response()->json($form, 200);
    }
}
