<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use App\Pipes\StringifyArrays;
use App\Pipes\RemoveWebhookData;
use Illuminate\Pipeline\Pipeline;
use App\Http\Controllers\Controller;
use App\Pipes\ConvertResponsesToJson;
use App\Pipes\MergeResponsesIntoRoot;
use App\Http\Resources\FormSessionResource;

class FormSubmissionsExportController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('view', $form);

        $data = collect(
            FormSessionResource::collection(
                $form->formSessions()
                    ->whereNotNull('is_completed')
                    ->get()
            )->resolve()
        );


        /* With this block, we try to find all response keys that have been used
        in the collected forms data. Since there can be cases where a session
        is only partially submitted or fields have been added later on, so they
        are not contained in older form submissions.

        Goal here is that the exported data has all the fields from collected
        responses in it. */
        $keys = $data
            ->reduce(function ($sum, $session) {
                collect($session['responses'])
                    ->keys()
                    ->each(function ($item) use (&$sum) {
                        array_key_exists($item, $sum) ? null : $sum[$item] = null;
                    });

                return $sum;
            }, []);

        $exportFormatted = $data
            ->map(function ($session) use ($keys) {
                $result = array_merge($session, $keys, app(Pipeline::class)
                ->send($session)
                ->through([
                    MergeResponsesIntoRoot::class,
                    StringifyArrays::class,
                ])
                ->thenReturn());

                Arr::forget($result, 'responses');
                Arr::forget($result, 'id');

                return $result;
            })->toArray();

        return response()->streamDownload(function () use ($exportFormatted) {
            $out = fopen('php://output', 'w');
            fputcsv($out, array_keys($exportFormatted[0]));

            foreach ($exportFormatted as $row) {
                fputcsv($out, array_values($row));
            }

            fclose($out);
        }, Str::slug($form->name) . '.results.csv');
    }
}
