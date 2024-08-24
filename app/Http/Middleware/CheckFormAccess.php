<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Form;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFormAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->form) {
            $form = Form::withUuid($request->route('uuid'))->firstOrFail();
        } else {
            $form = $request->form;
        }

        if (! $form->is_published && ! $request->user()) {
            abort(404);
        }

        if (! $form->is_published && $request->user()->current_team_id !== $form->team_id) {
            abort(404);
        }

        return $next($request);
    }
}
