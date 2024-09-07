<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();

        /** Change index keys to BIGINT */
        Schema::table('forms', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned()->change();
            $table->bigInteger('user_id')->unsigned()->change();
        });

        Schema::table('form_blocks', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned()->change();
            $table->bigInteger('form_id')->unsigned()->change();
        });
        Schema::table('form_sessions', function (Blueprint $table) {
            $table->bigInteger('form_id')->unsigned()->change();
        });

        Schema::table('form_session_responses', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned()->change();
            $table->bigInteger('form_block_id')->default(1)->unsigned()->change();
            $table->bigInteger('form_block_interaction_id')->default(1)->unsigned()->change();
            $table->bigInteger('form_session_id')->unsigned()->change();
        });

        /** Remove unused columns */
        Schema::table('form_block_interactions', function (Blueprint $table) {
            $table->dropColumn('has_validation');
        });

        Schema::table('form_block_interactions', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });

        /** Add FOREIGN KEYS */
        Schema::table('form_blocks', function (Blueprint $table) {
            $table->foreign('form_id')
                ->references('id')->on('forms')
                ->onDelete('CASCADE');
        });

        Schema::table('form_block_interactions', function (Blueprint $table) {
            $table->foreign('form_block_id')
                ->references('id')->on('form_blocks')
                ->onDelete('CASCADE');
        });

        Schema::table('form_sessions', function (Blueprint $table) {
            $table->foreign('form_id')
                ->references('id')->on('forms')
                ->onDelete('CASCADE');
        });

        Schema::table('form_session_responses', function (Blueprint $table) {
            $table->foreign('form_block_id')
                ->references('id')->on('form_blocks')
                ->onDelete('CASCADE');

            $table->foreign('form_block_interaction_id')
                ->references('id')->on('form_block_interactions')
                ->onDelete('CASCADE');

            $table->foreign('form_session_id')
                ->references('id')->on('form_sessions')
                ->onDelete('CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('form_blocks', function (Blueprint $table) {
            //
        });
    }
};
