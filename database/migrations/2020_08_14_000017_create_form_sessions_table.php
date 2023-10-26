<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
}
