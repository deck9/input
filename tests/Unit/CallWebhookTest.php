<?php

namespace Tests\Unit;

use Tests\TestCase;
use Tests\CreatesBlocks;
use App\Jobs\CallWebhook;
use App\Models\FormBlock;
use App\Models\FormSessionResponse;
use App\Models\FormBlockInteraction;
use Illuminate\Support\Facades\Http;
use App\Enums\FormBlockInteractionType;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CallWebhookTest extends TestCase
{
    use RefreshDatabase, CreatesBlocks;

    /** @test */
    public function the_webhook_jobs_submits_response_data_to_webhook_url()
    {
        Http::fake();

        $block = FormBlock::factory()->create([
            'webhook_url' => url('tools/webhook')
        ]);

        $interaction = FormBlockInteraction::factory()->create([
            'label' => 'Yes',
            'type' => FormBlockInteractionType::button,
            'form_block_id' => $block->id,
        ]);

        $response = FormSessionResponse::factory()->create([
            'form_block_interaction_id' => $interaction->id,
            'form_block_id' => $block->id,
            'value' => 'Yes',
        ]);

        $job = new CallWebhook($response->session, $block->webhook_url);
        $job->handle();

        Http::assertSent(function ($request) use ($response, $block) {
            return $request->url() == $block->webhook_url &&
                $request['_id'] == $response->session->token &&
                $request[$block->uuid] == 'Yes';
        });
    }
}
