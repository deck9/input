<?php

namespace App\Jobs;

use App\Http\Resources\FormSessionResource;
use App\Models\FormSession;
use App\Models\FormWebhook;
use GuzzleHttp\RequestOptions;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CallWebhookJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public $session;

    public $webhook;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(FormSession $session, FormWebhook $webhook)
    {
        $this->session = $session;
        $this->webhook = $webhook;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $payload = FormSessionResource::make($this->session)->resolve();

        $response = Http::withHeaders(
            $this->webhook->headers ?? []
        )->send(
            $this->webhook->webhook_method,
            $this->webhook->webhook_url,
            [
                RequestOptions::JSON => $payload,
            ]
        );

        Log::debug('Webhook response', [
            'status' => $response->status(),
            'body' => $response->body(),
            'json' => $response->json(),
            'headers' => $response->headers(),
        ]);

        $this->session->webhooks()->updateOrCreate([
            'form_webhook_id' => $this->webhook->id,
        ], [
            'status' => $response->status(),
            'response' => $response->json() ?? $response->body(),
            'tries' => $this->session->webhooks()->where('form_webhook_id', $this->webhook->id)->count() + 1,
        ]);
    }
}
