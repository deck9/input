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
        Schema::table('form_block_interactions', function (Blueprint $table) {
            $table->after('type', function (Blueprint $table) {
                $table->string('name')->nullable();
                $table->boolean('is_editable')->default(true);
                $table->boolean('is_disabled')->default(false);
            });
        });
    }
};
