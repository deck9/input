<?php

namespace App\Jobs;

use App\Models\FormSession;
use Illuminate\Bus\Queueable;
use App\Models\FormIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use App\Http\Resources\FormSessionResource;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class CallWebhookJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public $session;
    public $integration;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(FormSession $session, FormIntegration $integration)
    {
        $this->session = $session;
        $this->integration = $integration;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $payload = FormSessionResource::make($this->session)->resolve();

        Http::withHeaders(
            $this->integration->headers
        )->send(
            $this->integration->webhook_method,
            $this->integration->webhook_url,
            [
                'form_params' => $payload,
            ]
        );

        // TODO: we need to somehow track status of the webhook submit in a new table with relation to the session and the integration
    }
}
