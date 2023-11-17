<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Knuckles\Scribe\Attributes\Group;

class GetFormStoryboardController extends Controller
{
    /**
     * Get the form storyboard
     *
     * The storyboard is a sequential list of all the form blocks and their configuration. It contains all the information needed to render the form.
     */
    #[Group('Public Form Endpoints')]
    public function __invoke(Form $form)
    {
        return response()->json($form->getPublicStoryboard(), 200);
    }
}
