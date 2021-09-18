<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFormSessionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('form_sessions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('form_id');
            $table->string('token', 32);
            $table->longText('params')->nullable();
            $table->dateTime('is_completed')->nullable();
            $table->boolean('has_data_privacy')->default(false);
            $table->nullableTimestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('conversations');
    }
}
