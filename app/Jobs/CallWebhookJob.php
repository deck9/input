<?php

namespace App\Jobs;

use Exception;
use App\Models\FormSession;
use App\Models\FormWebhook;
use Illuminate\Bus\Queueable;
use GuzzleHttp\RequestOptions;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use App\Http\Resources\FormSessionResource;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\NoPrivateNetworkHttpClient;
use Symfony\Component\HttpClient\Exception\TransportException;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

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


        $client = new NoPrivateNetworkHttpClient(HttpClient::create());

        $client->withOptions([
            'headers' => $this->webhook->headers ?? []
        ]);


        $response = $client->request($this->webhook->webhook_method, $this->webhook->webhook_url, [
            'json' => $payload,
        ]);

        try {

            $status = $response->getStatusCode();
            $body = $response->getContent();
            $json = $response->toArray();
            $headers = $response->getHeaders();
        } catch (HttpExceptionInterface $e) {
            $errorResponse = $e->getResponse();

            $status = $errorResponse->getStatusCode(false);
            $body = $errorResponse->getContent(false);
            $json = $errorResponse->toArray(false);
            $headers = $errorResponse->getHeaders(false);
        } catch (Exception $e) {
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
