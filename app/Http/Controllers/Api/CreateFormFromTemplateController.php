<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FormTemplateRequest;
use App\Models\Form;
use Illuminate\Support\Facades\DB;
use Knuckles\Scribe\Attributes\Group;

class CreateFormFromTemplateController extends Controller
{
    /**
     * Create a form from a template
     *
     * This endpoint creates a new form in the user's current team from a template.
     *
     * @hideFromAPIDocumentation
     */
    #[Group('Templates')]
    public function __invoke(FormTemplateRequest $request)
    {
        $request->validate(['name' => 'nullable|string|max:255']);

        $template = $request->template();

        // a template that fails halfway leaves no empty form behind
        $form = DB::transaction(function () use ($request, $template) {
            $form = Form::create([
                'name' => $request->name ?? 'Untitled Form',
                'user_id' => $request->user()->id,
                'team_id' => $request->user()->currentTeam->id,
                'has_data_privacy' => false,
                'brand_color' => Form::DEFAULT_BRAND_COLOR,
            ]);

            $form->applyTemplate($template);

            return $form;
        });

        return response()->json($form, 201);
    }
}
