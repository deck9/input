<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('form_session_uploads', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid');
            $table->string('name');
            $table->string('path');
            $table->string('type');
            $table->string('size');
            $table->unsignedBigInteger('form_session_response_id');
            $table->timestamps();
        });

        Schema::table('form_session_uploads', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->foreign('form_session_response_id')
                    ->references('id')->on('form_session_responses')
                    ->onDelete('CASCADE');
            }
        });
    }
};
