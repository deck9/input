<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasTeam
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->expectsJson()) {
            return $this->handleApi($request, $next);
        } else {
            return $this->handleWeb($request, $next);
        }
    }

    protected function handleApi(Request $request, Closure $next): Response
    {
        // if user is not logged in, allow them to proceed
        if (! $request->user()) {
            return $next($request);
        }

        // check if user has a current team
        // if they do, allow them to proceed
        if ($request->user()->currentTeam) {
            return $next($request);
        }

        // otherwise, get all teams for the user
        $teams = $request->user()->allTeams();

        // if user has no team at this point, return a 403
        if ($teams->count() === 0) {
            return abort(403, 'You are not a member of any team.');
        }

        // otherwise, switch to the first team
        $request->user()->switchTeam($teams->first());

        return $next($request);
    }

    protected function handleWeb(Request $request, Closure $next): Response
    {
        // if user is not logged in, allow them to proceed
        if (! $request->user()) {
            return $next($request);
        }

        // check if user has a current team
        // if they do, allow them to proceed
        if ($request->user()->currentTeam) {
            return $next($request);
        }

        $whitelistedRoutes = [
            'teams.missing',
            'teams.create',
            'teams.store',
            'team-invitations.accept',
            'logout',

            'sanctum.csrf-cookie',

            'verification.notice',
            'verification.send',
            'verification.verify',

            'password.email',
            'password.request',
            'password.reset',
            'password.update',
        ];

        // whitelist some routes
        if (in_array($request->route()->getName(), $whitelistedRoutes)) {
            return $next($request);
        }

        // otherwise, get all teams for the user
        $teams = $request->user()->allTeams();

        // if the user is the first user, redirect them to the create team page
        if ($teams->count() === 0 && User::count() === 1) {
            return redirect()->route('teams.create');
        }

        // if user has no team at this point, redirect them to the missing team page
        if ($teams->count() === 0) {
            return redirect()->route('teams.missing');
        }

        // otherwise, switch to the first team
        $request->user()->switchTeam($teams->first());

        return $next($request);
    }
}
