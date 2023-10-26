<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFormSessionResponsesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('form_session_responses', function (Blueprint $table) {
            $table->increments('id');
            $table->string('value', 2048)->nullable();
            $table->string('meta', 1024)->nullable();
            $table->bigInteger('form_block_id')->default(1);
            $table->bigInteger('form_block_interaction_id')->default(1);
            $table->bigInteger('form_session_id');
            $table->nullableTimestamps();
        });
    }
}
