<?php

namespace App\Console\Commands;

use App\Actions\ForceDeleteForms;
use App\Models\Form;
use App\Models\FormSessionUpload;
use Illuminate\Console\Command;

class PruneOrphanedForms extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'input:prune-orphaned-forms {--force : Delete the forms instead of only listing them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List the forms of teams deleted before v2.2. With --force, delete them with their submissions and files.';

    /**
     * Execute the console command.
     */
    public function handle(ForceDeleteForms $forceDeleteForms): void
    {
        // deleting a team before v2.2 left its forms behind, trashed ones too
        $forms = Form::withTrashed()->whereDoesntHave('team')
            ->withCount(['formSessions' => fn ($query) => $query->whereNotNull('is_completed')])
            ->orderBy('id')->get();

        if ($forms->isEmpty()) {
            $this->info('No forms of deleted teams found.');

            return;
        }

        $this->table(['ID', 'Name', 'Submissions', 'Uploaded files'], $forms->map(fn (Form $form) => [
            $form->id,
            $form->name,
            $form->form_sessions_count,
            FormSessionUpload::whereHas('formSessionResponse.formSession', fn ($query) => $query->where('form_id', $form->id))->count(),
        ]));

        if (! $this->option('force')) {
            $this->warn('Dry run, nothing was deleted. Back up your database and files, then run it again with --force to delete these forms.');

            return;
        }

        $forceDeleteForms->delete($forms);

        $this->info("Deleted {$forms->count()} forms with their submissions and files.");
    }
}
