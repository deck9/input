<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFormsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('forms', function (Blueprint $table) {
            $table->increments('id');
            $table->string('uuid', 36);
            $table->string('name');
            $table->string('description', 1024)->nullable();
            $table->string('avatar_path', 1024)->nullable();
            $table->string('preview_image_path')->nullable();
            $table->string('brand_color')->nullable();
            $table->string('interaction_text_color', 32)->nullable();
            $table->string('interaction_background_color', 32)->nullable();
            $table->string('user_message_text_color', 32)->nullable();
            $table->string('user_message_background_color', 32)->nullable();
            $table->string('message_text_color', 32)->nullable();
            $table->string('message_background_color', 32)->nullable();
            $table->string('eoc_text')->nullable();
            $table->string('eoc_headline')->nullable();
            $table->integer('data_retention_days')->nullable();
            $table->string('legal_notice_link')->nullable();
            $table->string('privacy_link')->nullable();
            $table->boolean('has_data_privacy')->default(false);
            $table->string('cta_label')->nullable();
            $table->string('cta_link')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('github')->nullable();
            $table->string('instagram')->nullable();
            $table->string('facebook')->nullable();
            $table->string('twitter')->nullable();
            $table->boolean('show_cta_link')->default(false);
            $table->boolean('show_social_links')->default(false);
            $table->boolean('is_notification_via_mail')->default(false);
            $table->unsignedInteger('user_id')->nullable();
            $table->dateTime('published_at')->nullable();
            $table->nullableTimestamps();
            $table->softDeletes();
        });
    }
}
