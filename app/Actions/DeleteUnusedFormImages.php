<?php

namespace App\Actions;

use App\GlideCache;
use App\Models\Form;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class DeleteUnusedFormImages
{
    /**
     * Delete the given form images and their resized copies, unless a form still uses them.
     *
     * @param  Collection<int, ?string>  $paths
     */
    public function delete(Collection $paths): void
    {
        $paths = $paths->filter()->unique();

        // a duplicated form shares the images of the original, a trashed form can still be restored
        $used = Form::withTrashed()
            ->where(fn ($query) => $query->whereIn('avatar_path', $paths)->orWhereIn('background_path', $paths))
            ->get(['avatar_path', 'background_path'])
            ->flatMap(fn ($form) => [$form->avatar_path, $form->background_path]);

        $cache = new GlideCache;

        $paths->diff($used)->each(function ($path) use ($cache) {
            Storage::delete($path);
            $cache->clear($path);
        });
    }
}
