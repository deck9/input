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
            $table->renameColumn('has_parent_interaction', 'parent_block');
        });

        Schema::table('form_blocks', function (Blueprint $table) {
            $table->string('parent_block', 32)->change();
        });
    }
};
