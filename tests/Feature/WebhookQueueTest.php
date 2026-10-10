<?php

use App\Listeners\FormSubmitWebhookListener;
use App\Mail\FormSubmissionNotification;
use App\Models\Form;
use App\Models\FormSession;
use App\Models\FormWebhook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

uses(RefreshDatabase::class);

it('answers a submit without calling webhooks or sending mail', function () {
    config(['queue.default' => 'database']);

    $client = new MockHttpClient(fn () => throw new Exception('webhook called during the submit'));
    app()->instance(HttpClientInterface::class, $client);

    $form = Form::factory()
        ->has(FormWebhook::factory(['webhook_url' => 'https://example.com/hook']))
        ->create(['is_notification_via_mail' => true]);
    $session = FormSession::factory()->for($form)->create();

    $this->json('POST', route('api.public.forms.submit', ['form' => $form->uuid]), [
        'token' => $session->token,
        'payload' => [],
    ])->assertStatus(200);

    $queued = DB::table('jobs')->pluck('payload')
        ->map(fn ($payload) => json_decode($payload)->displayName);

    expect($client->getRequestsCount())->toBe(0)
        ->and($queued)->toContain(FormSubmitWebhookListener::class)
        ->and($queued)->toContain(FormSubmissionNotification::class);
});

it('runs a queue worker in the docker image', function () {
    expect(file_get_contents(base_path('Dockerfile')))
        ->toContain('ENV QUEUE_CONNECTION=database')
        ->toContain('scripts/queue-worker.conf');

    expect(file_get_contents(base_path('scripts/queue-worker.conf')))
        ->toContain('artisan queue:work');
});
