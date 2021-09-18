<?php

namespace App\Jobs;

use App\Models\FormSession;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class CallWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $session;
    public $webhookUrl;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(FormSession $session, String $webhookUrl)
    {
        $this->session = $session;
        $this->webhookUrl = $webhookUrl;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $responses = $this->session->responses->mapWithKeys(function ($response) {
            return [$response->block->uuid => $response->value];
        });

        $request = array_merge([
            '_id' => $this->session->token,
        ], $responses->toArray());

        info('send snippet webhook to ' . $this->webhookUrl, [
            'payload' => $request,
        ]);

        Http::post($this->webhookUrl, $request);
    }
}
