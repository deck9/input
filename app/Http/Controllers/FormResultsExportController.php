<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Spatie\Fractal\Facades\Fractal;
use App\Http\Controllers\Controller;
use App\Http\Resources\FormSessionResource;
use App\Transformers\FormSessionTransformer;

class FormResultsExportController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('view', $form);

        $completedSessions = $form->formSessions()->whereNotNull('is_completed')->get();
        $export = collect(FormSessionResource::collection($completedSessions)->resolve());

        $keys = $export
            ->reduce(function ($sum, $session) {
                collect($session['responses'])
                    ->each(function ($item) use (&$sum) {
                        array_key_exists($item['name'], $sum) ? null : $sum[$item['name']] = null;
                    });

                return $sum;
            }, []);

        $exportFormatted = $export
            ->map(function ($session) use ($keys) {
                $responses = collect($session['responses'])
                    ->mapWithKeys(function ($response) {
                        return [
                            $response['name'] => $response['value'],
                        ];
                    })->toArray();

                unset($session['responses']);
                return array_merge($session, $keys, $responses);
            })->toArray();

        return response()->streamDownload(function () use ($exportFormatted) {
            $out = fopen('php://output', 'w');
            fputcsv($out, array_keys($exportFormatted[0]));

            foreach ($exportFormatted as $row) {
                fputcsv($out, array_values($row));
            }

            fclose($out);
        }, $form->name . '-results.csv');
    }
}
