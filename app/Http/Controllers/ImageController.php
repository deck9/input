<?php

namespace App\Http\Controllers;

use App\GlideCache;
use App\Models\Form;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    // the variants the app requests (form.blade.php, ImageUpload.vue), keys sorted;
    // any other set would render and store a new file
    private const VARIANTS = [
        [],
        ['q' => '75', 'w' => '256'],
        ['fm' => 'webp', 'w' => '1600'],
        ['fm' => 'webp', 'w' => '1920'],
        ['fm' => 'webp', 'w' => '2880'],
    ];

    public function show(Request $request, $path)
    {
        $params = $request->query();
        ksort($params);

        abort_unless(
            in_array($params, self::VARIANTS, true)
                && Form::where('avatar_path', $path)->orWhere('background_path', $path)
                    ->get(['avatar_path', 'background_path'])
                    // compared here, the database ignores case and trailing spaces
                    ->contains(fn (Form $form) => in_array($path, [$form->avatar_path, $form->background_path], true)),
            404
        );

        $server = with(new GlideCache)->getServer();

        return $server->getImageResponse($path, $params);
    }
}
