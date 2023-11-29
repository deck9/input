<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/forms/*')) {
                try {
                    $search = explode('\\', $e->getPrevious()->getModel());
                    $model = end($search);
                } catch (\Exception $e) {
                    $model = 'Record';
                }

                return response()->json([
                    'message' => $model.' not found.',
                ], 404);
            }
        });

        $this->reportable(function (Throwable $e) {
            //
        });
    }
}
