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
        Schema::table('form_blocks', function (Blueprint $table) {
            $table->boolean('is_required')
                ->default(false)
                ->nullable()
                ->after('uuid');
        });
    }
};
