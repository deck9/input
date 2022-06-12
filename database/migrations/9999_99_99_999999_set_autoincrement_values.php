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
        if (app()->environment('production')) {
            if (config('database.default') === 'sqlite') {
                DB::statement("UPDATE sqlite_sequence SET seq = 10000 WHERE name = 'forms'");
                DB::statement("UPDATE sqlite_sequence SET seq = 5000 WHERE name = 'form_blocks'");
            } else {
                DB::statement("ALTER TABLE forms AUTO_INCREMENT = 10000;");
                DB::statement("ALTER TABLE form_blocks AUTO_INCREMENT = 5000;");
            }
        }
    }
};
