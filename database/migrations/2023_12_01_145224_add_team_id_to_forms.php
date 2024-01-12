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

        // make all teams non personal teams
        DB::statement('UPDATE teams SET personal_team = 0');

        // Overwrite the default team name if it is the old default
        DB::statement('UPDATE teams SET name = "Your Team" WHERE name = "\'s Team"');

        if (DB::getDriverName() === 'sqlite') {
            // this is the sqlite version for the migration
            DB::statement('UPDATE forms SET team_id=teams.id FROM(SELECT*FROM teams)AS teams WHERE teams.user_id=forms.user_id');
        } else {
            // set team id on all forms based on user who created the form
            DB::statement('UPDATE forms INNER JOIN teams on forms.user_id = teams.user_id SET forms.`team_id` = teams.id');
        }
    }
};
