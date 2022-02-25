<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSequenceAttributeToBlockInteractions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('form_block_interactions', function (Blueprint $table) {
            $table->integer('sequence')->nullable()->after('has_validation');
        });
    }
}
