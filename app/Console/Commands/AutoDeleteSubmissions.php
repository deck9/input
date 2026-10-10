<?php

namespace App\Console\Commands;

use App\Models\Form;
use Illuminate\Console\Command;

class AutoDeleteSubmissions extends Command
{
    /**
     * The number of submissions cleaned.
     *
     * @var int
     */
    protected $cleaned = 0;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'input:auto-delete-submissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command will delete old submissions if auto delete is enabled for the form using the retention days specified on the form.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        Form::withTrashed()
            ->where('is_auto_delete_enabled', true)
            ->where('data_retention_days', '>=', 1)
            ->lazyById()
            ->each(function (Form $form) {
                // one by one, so each session also deletes its uploaded files
                $form->formSessions()
                    ->where('updated_at', '<', now()->subDays($form->data_retention_days))
                    ->lazyById()
                    ->each(function ($session) {
                        $session->delete();
                        $this->cleaned++;
                    });
            });

        $this->info("Cleaned {$this->cleaned} submissions.");
    }
}
