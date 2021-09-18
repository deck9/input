<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFormBlockInteractionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('form_block_interactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('uuid', 36);
            $table->string('type');
            $table->string('label')->nullable();
            $table->mediumText('reply')->nullable();
            $table->string('has_validation')->nullable();
            $table->unsignedBigInteger('form_block_id');
            $table->softDeletes();
            $table->nullableTimestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('interactions');
    }
}
