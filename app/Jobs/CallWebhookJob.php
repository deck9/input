<?php

namespace App\Jobs;

use App\Http\Resources\FormSessionResource;
use App\Models\FormSession;
use App\Models\FormWebhook;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

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
    public function handle(HttpClientInterface $client)
    {
        $payload = FormSessionResource::make($this->session)->resolve();

        $client->withOptions([
            'headers' => $this->webhook->headers ?? [],
        ]);

        $response = $client->request($this->webhook->webhook_method, $this->webhook->webhook_url, [
            'json' => $payload,
        ]);

        try {
            $status = $response->getStatusCode();
            $body = $response->getContent();
            $json = json_decode($body);
            $headers = $response->getHeaders();
        } catch (HttpExceptionInterface $e) {
            $errorResponse = $e->getResponse();

            $status = $errorResponse->getStatusCode(false);
            $body = $errorResponse->getContent(false);
            $json = json_decode($body);
            $headers = $errorResponse->getHeaders(false);
        } catch (\Exception $e) {
            $status = 500;
            $body = $e->getMessage();
            $json = ['error' => $e->getMessage()];
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
    }
}
