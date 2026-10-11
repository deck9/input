<?php

namespace App\Http\Controllers\Api;

use App\Actions\DeleteUnusedFormImages;
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
    public function store(FormImageRequest $request, Form $form, DeleteUnusedFormImages $deleteUnusedImages)
    {
        $this->authorize('update', $form);

        $file = $request->file('image');
        $fieldname = $request->input('type').'_path';
        $oldPath = $form->$fieldname;

        $filename = sprintf('%s.%s.%s', strtolower(Str::random(6)), time(), $file->extension());

        $path = implode('/', [$form->uuid, $filename]);

        // the disks don't throw ('throw' => false): a refused write only returns false, and the old image stays
        if ($file->storeAs($form->uuid, $filename) === false) {
            // a write that broke off can leave part of the file behind
            Storage::delete($path);

            abort(500, 'The image could not be stored. Please try again.');
        }

        // save to form model
        $form->$fieldname = $path;
        $form->save();

        $deleteUnusedImages->delete(collect([$oldPath]));

        return response()->json($form, 201);
    }

    /**
     * Delete a form image
     *
     * This endpoint deletes an image for the specified form.
     */
    public function delete(Request $request, Form $form, DeleteUnusedFormImages $deleteUnusedImages)
    {
        $this->authorize('update', $form);

        $request->validate([
            'type' => 'required|in:avatar,background',
        ]);

        $fieldname = $request->input('type').'_path';
        $oldPath = $form->$fieldname;

        // clear the path even when its file is already gone, so a broken image can be removed
        $form->$fieldname = null;
        $form->save();

        $deleteUnusedImages->delete(collect([$oldPath]));

        return response()->json($form, 200);
    }
}
