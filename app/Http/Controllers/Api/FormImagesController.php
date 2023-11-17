<?php

namespace App\Http\Controllers\Api;

use App\GlideCache;
use App\Http\Controllers\Controller;
use App\Http\Requests\FormImageRequest;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;

#[Group('Form Images')]
#[Authenticated]
class FormImagesController extends Controller
{
    /**
     * Upload a new form image
     *
     * This endpoint uploads a new image for the specified form. This can be a logo or a background image.
     */
    public function store(FormImageRequest $request, Form $form)
    {
        $this->authorize('update', $form);

        $file = $request->file('image');
        $fieldname = $request->input('type').'_path';

        // if old file, clear that first
        if ($form->$fieldname) {
            Storage::delete($form->$fieldname);
            with(new GlideCache)->clear($form->$fieldname);
        }

        $filename = sprintf('%s.%s.%s', strtolower(Str::random(6)), time(), $file->extension());

        // store to filesystem
        $file->storeAs($form->uuid, $filename);

        // save to form model
        $form->$fieldname = implode('/', [$form->uuid, $filename]);
        $form->save();

        return response()->json($form, 201);
    }

    /**
     * Delete a form image
     *
     * This endpoint deletes an image for the specified form.
     */
    public function delete(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $request->validate([
            'type' => 'required|in:avatar,background',
        ]);

        $fieldname = $request->input('type').'_path';

        // remove image from disk and cache
        if ($form->hasImage($request->input('type'))) {
            Storage::delete($form->$fieldname);
            $cache = new GlideCache;
            $cache->clear($form->$fieldname);

            $form->$fieldname = null;
            $form->save();
        }

        return response()->json($form, 200);
    }
}
