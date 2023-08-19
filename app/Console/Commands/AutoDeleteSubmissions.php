<?php

namespace App\Console\Commands;

use App\Models\Form;
use Illuminate\Console\Command;

class AutoDeleteSubmissions extends Command
{
    /**
     * The number of submissions cleaned.
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
        Form::has('formSessions')->lazyById()->each(function (Form $form) {
            if (is_null($form->data_retention_days)) {
                return;
            }

            $form->formSessions()->lazyById()->each(function ($session) use ($form) {
                $retentionDays = $form->data_retention_days;

                if ($session->updated_at->diffInDays(now()) > $retentionDays) {
                    $session->delete();
                    $this->cleaned++;
                }

            });
        });

        $this->info("Cleaned {$this->cleaned} submissions.");
    }
}
