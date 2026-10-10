<?php

namespace App\Actions\Jetstream;

use App\Models\Form;
use App\Models\Team;
use Illuminate\Support\Facades\DB;
use Laravel\Jetstream\Contracts\DeletesTeams;
use Laravel\Jetstream\Contracts\DeletesUsers;

class DeleteUser implements DeletesUsers
{
    /**
     * The team deleter implementation.
     *
     * @var \Laravel\Jetstream\Contracts\DeletesTeams
     */
    protected $deletesTeams;

    /**
     * Create a new action instance.
     *
     * @return void
     */
    public function __construct(DeletesTeams $deletesTeams)
    {
        $this->deletesTeams = $deletesTeams;
    }

    /**
     * Delete the given user.
     *
     * @param  mixed  $user
     * @return void
     */
    public function delete($user)
    {
        DB::transaction(function () use ($user) {
            $this->deleteTeams($user);
            $this->handOverForms($user);
            $user->deleteProfilePhoto();
            $user->tokens->each->delete();
            $user->delete();
        });
    }

    /**
     * Delete the teams and team associations attached to the user.
     *
     * @param  mixed  $user
     * @return void
     */
    protected function deleteTeams($user)
    {
        $user->teams()->detach();

        $user->ownedTeams->each(function ($team) {
            $this->deletesTeams->delete($team);
        });
    }

    /**
     * Give the forms the user made in other teams to each team's owner.
     *
     * @param  mixed  $user
     * @return void
     */
    protected function handOverForms($user)
    {
        Team::whereIn('id', Form::withTrashed()->where('user_id', $user->id)->select('team_id'))
            ->each(function (Team $team) use ($user) {
                $team->forms()->withTrashed()->where('user_id', $user->id)->update(['user_id' => $team->user_id]);
            });
    }
}
