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
        Schema::table('forms', function (Blueprint $table) {
            $table->string('submit_method', 8)->nullable()->after('show_social_links');
            $table->string('submit_webhook', 1024)->nullable()->after('show_social_links');
        });
    }
};
