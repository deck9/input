<?php

namespace App\Jobs;

use App\Http\Resources\FormSessionResource;
use App\Models\FormSession;
use App\Models\FormWebhook;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Jobs\SyncJob;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CallWebhookJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public $session;

    public $webhook;

    public $tries = 5;

    // seconds to wait before each retry: 1 minute, 5 minutes, 15 minutes, 1 hour
    public $backoff = [60, 300, 900, 3600];

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
    public function handle(HttpClientInterface $client)
    {
        $payload = FormSessionResource::make($this->session)->resolve();
        $error = null;

        try {
            // the private network guard throws here for internal addresses
            $response = $client->request($this->webhook->webhook_method, $this->webhook->webhook_url, [
                'headers' => $this->webhook->headers ?? [],
                'json' => $payload,
                'max_duration' => 10,
            ]);

            $status = $response->getStatusCode();
            $body = $response->getContent(false);
            $json = json_decode($body);
            $headers = $response->getHeaders(false);
        } catch (\Exception $e) {
            $error = $e;
            $status = 500;
            // the team sees this text, so it says nothing about the server's network
            $body = 'The webhook URL could not be reached.';
            $json = ['error' => $body];
            $headers = [];
        }

        Log::debug('Webhook response', [
            'status' => $status,
            'body' => $body,
            'json' => $json,
            'headers' => $headers,
        ]);

        $this->session->webhooks()->updateOrCreate([
            'form_webhook_id' => $this->webhook->id,
        ], [
            'status' => $status,
            'response' => $json ?? $body,
            'tries' => $this->session->webhooks()->where('form_webhook_id', $this->webhook->id)->count() + 1,
        ]);

        // fail so the queue retries; on the sync queue this would fail the submit itself
        if ($status >= 500 && ! $this->job instanceof SyncJob) {
            throw $error ?? new RuntimeException("The webhook answered with status {$status}.");
        }
    }
}
