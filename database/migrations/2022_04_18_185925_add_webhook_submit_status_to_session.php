<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('form_sessions', function (Blueprint $table) {
            $table->integer('webhook_submit_status')->nullable()->after('has_data_privacy');
        });
    }
};
