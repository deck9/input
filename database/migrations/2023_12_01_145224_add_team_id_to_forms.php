<?php

use App\Models\Team;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('forms', function (Blueprint $table) {
            $table->foreignIdFor(Team::class)->after('user_id');
        });

        // set team id on all forms based on user who created the form
        DB::statement('UPDATE forms INNER JOIN teams on forms.user_id = teams.user_id SET forms.`team_id` = teams.id');
    }
};
