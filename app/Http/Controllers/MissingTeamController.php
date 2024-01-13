<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MissingTeamController extends Controller
{
    public function __invoke(Request $request)
    {
        return inertia('Teams/MissingTeam');
    }
}
