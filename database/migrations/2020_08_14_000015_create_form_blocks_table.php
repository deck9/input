<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFormBlocksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('form_blocks', function (Blueprint $table) {
            $table->increments('id');
            $table->string('type');
            $table->text('message')->nullable();
            $table->string('title', 1024)->nullable();
            $table->longText('options')->nullable();
            $table->text('responses')->nullable();
            $table->string('uuid', 36);
            $table->bigInteger('has_parent_interaction')->nullable();
            $table->string('webhook_url')->nullable();
            $table->unsignedInteger('sequence')->default(0);
            $table->unsignedInteger('form_id');
            $table->nullableTimestamps();
        });
    }
}
