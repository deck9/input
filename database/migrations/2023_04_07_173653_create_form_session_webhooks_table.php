<?php

use App\Models\FormSession;
use App\Models\FormWebhook;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('form_session_webhooks', function (Blueprint $table) {
            $table->id();
            $table->integer('status')->nullable();
            $table->json('response')->nullable();
            $table->integer('tries')->default(0);
            $table->foreignIdFor(FormSession::class);
            $table->foreignIdFor(FormWebhook::class);
            $table->timestamps();

            // make form_session_id and form_webhook_id unique, so we can't have duplicate entries
            $table->unique(['form_session_id', 'form_webhook_id']);
        });
    }
};
