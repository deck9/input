<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();

        Schema::table('form_session_responses', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['form_block_id']);
                $table->dropForeign(['form_block_interaction_id']);

                $table->foreign('form_block_id')
                    ->references('id')->on('form_blocks')
                    ->onDelete('CASCADE');

                $table->foreign('form_block_interaction_id')
                    ->references('id')->on('form_block_interactions')
                    ->onDelete('CASCADE');
            }
        });

        Schema::enableForeignKeyConstraints();
    }
};
