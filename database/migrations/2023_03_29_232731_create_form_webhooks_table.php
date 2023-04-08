<?php

use App\Models\Form;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('form_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('webhook_url', 1024);
            $table->string('webhook_method', 8);
            $table->json('headers')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->string('provider')->nullable();
            $table->foreignIdFor(\App\Models\Form::class)
                ->references('id')->on('forms')
                ->onDelete('CASCADE');
            $table->timestamps();
        });

        // We need to fetch the old webhook configs and migrate them to the new table
        DB::table('forms')->orderBy('id')->chunk(100, function ($forms) {
            foreach ($forms as $form) {
                if ($form->submit_webhook) {
                    DB::table('form_webhooks')->insert([
                        'name' => 'Default',
                        'webhook_url' => $form->submit_webhook,
                        'webhook_method' => $form->submit_method,
                        'form_id' => $form->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        // delete old fields from forms table
        Schema::table('forms', function (Blueprint $table) {
            $table->dropColumn(['submit_method', 'submit_webhook']);
        });
    }
};
