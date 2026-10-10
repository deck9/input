<?php

namespace App\Http\Controllers;

use App\Enums\FormBlockType;
use App\Http\Resources\FormSessionResource;
use App\Models\Form;
use App\Pipes\MergeResponsesIntoRoot;
use App\Pipes\StringifyArrays;
use Illuminate\Pipeline\Pipeline;
use Illuminate\Support\Str;

class FormSubmissionsExportController extends Controller
{
    public function __invoke(Form $form)
    {
        $this->authorize('view', $form);

        // one column per question, so every row has the same columns, even with no submissions
        $header = array_merge(
            ['uid', 'form', 'started_at', 'completed_at', 'params'],
            $form->formBlocks()
                ->whereNotIn('type', [FormBlockType::none, FormBlockType::group])
                ->pluck('uuid')
                ->all()
        );

        return response()->streamDownload(function () use ($form, $header) {
            $out = fopen('php://output', 'w');

            // Add BOM for UTF-8 to help software like Excel to correctly identify encoding
            fwrite($out, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($out, $header);

            $form->formSessions()
                ->whereNotNull('is_completed')
                ->with([
                    'form',
                    'formSessionResponses.formBlock',
                    'formSessionResponses.formBlockInteraction',
                    'formSessionResponses.formSessionUploads',
                ])
                ->lazyById(500)
                ->each(function ($session) use ($out, $header) {
                    $row = app(Pipeline::class)
                        ->send(FormSessionResource::make($session)->resolve())
                        ->through([
                            MergeResponsesIntoRoot::class,
                            StringifyArrays::class,
                        ])
                        ->thenReturn();

                    fputcsv($out, array_map(fn ($key) => $this->escapeFormula($row[$key] ?? null), $header));
                });

            fclose($out);
        }, Str::slug($form->name).'.results.csv');
    }

    // spreadsheet apps run a cell that starts with one of these as a formula
    private function escapeFormula($value)
    {
        return is_string($value) && preg_match('/^[=+\-@\t\r]/', $value) ? "'".$value : $value;
    }
}
