<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckUserSetup
{
    protected $CACHE_KEY = 'check-user-setup';

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isSetupDone = Cache::get($this->CACHE_KEY, false);

        Inertia::share('isFirstSetup', !$isSetupDone);

        if (!$isSetupDone && User::count() === 0) {
            return redirect('/register');
        }

        if (!$isSetupDone) {
            Cache::forever($this->CACHE_KEY, true);
        }

        return $next($request);
    }
}
