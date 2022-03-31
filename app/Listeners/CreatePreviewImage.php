<?php

namespace App\Listeners;

use Spatie\Browsershot\Browsershot;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class CreatePreviewImage implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(Browsershot $browsershot)
    {
        $this->browsershot = $browsershot;
    }

    /**
     * Handle the event.
     *
     * @param  object  $event
     * @return void
     */
    public function handle($event)
    {
        $relativePath = $event->form->uuid . '_' . time() . '.jpg';
        $outputPath = storage_path(
            join('/', [
                'app/public/previews',
                $relativePath
            ])
        );

        Storage::makeDirectory('previews');

        $this->browsershot->url(route('internal.meta-preview', $event->form->id))
            ->setNodeModulePath(base_path('node_modules'))
            ->windowSize(1200, 627)
            ->ignoreHttpsErrors()
            ->setScreenshotType('jpeg', 100)
            ->save($outputPath);

        $event->form->preview_image_path = $relativePath;
        $event->form->save();
    }
}
