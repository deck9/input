<?php

namespace App\Console\Commands;

use App\Actions\ForceDeleteForms;
use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use App\Models\FormBlockLogic;
use App\Models\FormSession;
use App\Models\FormSessionResponse;
use App\Models\FormSessionUpload;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PruneOrphanedForms extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'input:prune-orphaned-forms {--force : Delete the forms and rows instead of only listing them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List the forms of teams deleted before v2.2, and rows that earlier deletes left behind. With --force, delete them with their submissions and files.';

    /**
     * Execute the console command.
     */
    public function handle(ForceDeleteForms $forceDeleteForms): void
    {
        // deleting a team before v2.2 left its forms behind, trashed ones too
        $forms = Form::withTrashed()->whereDoesntHave('team')
            ->withCount(['formSessions' => fn ($query) => $query->whereNotNull('is_completed')])
            ->orderBy('id')->get();
        $leftovers = array_filter(array_map(fn (Builder $rows) => $rows->count(), $this->leftoverRows()));

        if ($forms->isEmpty() && $leftovers === []) {
            $this->info('No forms of deleted teams and no rows left behind found.');

            return;
        }

        if ($forms->isNotEmpty()) {
            $this->table(['ID', 'Name', 'Submissions', 'Uploaded files'], $forms->map(fn (Form $form) => [
                $form->id,
                $form->name,
                $form->form_sessions_count,
                FormSessionUpload::whereHas('formSessionResponse.formSession', fn ($query) => $query->where('form_id', $form->id))->count(),
            ]));
        }

        if ($leftovers !== []) {
            $this->line('Rows that earlier deletes left behind, on installs without foreign keys:');
            $this->table(['Table', 'Rows'], array_map(null, array_keys($leftovers), $leftovers));
        }

        if (! $this->option('force')) {
            $this->warn('Dry run, nothing was deleted. Back up your database and files, then run it again with --force to delete these.');

            return;
        }

        if ($forms->isNotEmpty()) {
            $forceDeleteForms->delete($forms);
            $this->info("Deleted {$forms->count()} forms with their submissions and files.");
        }

        if ($leftovers !== []) {
            $this->deleteLeftoverRows();
            $this->info('Deleted the rows left behind, with their files.');
        }
    }

    /**
     * Rows whose parent is gone, children first. Installs without foreign keys kept them when the parent was deleted.
     *
     * @return array<string, Builder>
     */
    private function leftoverRows(): array
    {
        $liveForm = fn ($query) => $query->withTrashed();
        $liveBlock = fn ($query) => $query->whereHas('form', $liveForm);
        $liveInteraction = fn ($query) => $query->whereHas('formBlock', $liveBlock);
        $liveSession = fn ($query) => $query->whereHas('form', $liveForm);
        $liveResponse = fn ($query) => $query->whereHas('formSession', $liveSession)
            ->where(fn ($query) => $query->whereNull('form_block_id')->orWhereHas('formBlock', $liveBlock))
            ->where(fn ($query) => $query->whereNull('form_block_interaction_id')->orWhereHas('formBlockInteraction', $liveInteraction));

        return [
            'form_session_uploads' => FormSessionUpload::whereDoesntHave('formSessionResponse', $liveResponse),
            'form_session_responses' => FormSessionResponse::whereNot($liveResponse),
            'form_sessions' => FormSession::whereDoesntHave('form', $liveForm),
            'form_block_logics' => FormBlockLogic::whereDoesntHave('formBlock', $liveBlock),
            'form_block_interactions' => FormBlockInteraction::whereDoesntHave('formBlock', $liveBlock),
            'form_blocks' => FormBlock::whereDoesntHave('form', $liveForm),
        ];
    }

    private function deleteLeftoverRows(): void
    {
        $rows = $this->leftoverRows();
        $uploads = $rows['form_session_uploads'];

        // a file stays when an upload that isn't left behind uses it too
        $kept = FormSessionUpload::whereNotIn('id', $uploads->clone()->select('id'))->select('path');
        $files = $uploads->clone()->whereNotIn('path', $kept)->pluck('path');

        DB::transaction(function () use ($rows) {
            foreach ($rows as $query) {
                $query->delete();
            }
        });

        Storage::delete($files->all());
    }
}
