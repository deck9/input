<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// stores allowed files of file questions the way the upload reads them:
// whole numbers up to 10 stay, a decimal is cut, anything else is 10
return new class extends Migration
{
    public function up(): void
    {
        DB::table('form_block_interactions')
            ->where('type', 'file')
            ->whereNotNull('options')
            ->lazyById()
            ->each(function ($row) {
                $options = json_decode($row->options, true);
                $files = $options['allowedFiles'] ?? null;

                if ($files === null) {
                    return;
                }

                $stored = (int) $files >= 1 ? min((int) $files, 10) : 10;

                if ($stored !== $files) {
                    DB::table('form_block_interactions')
                        ->where('id', $row->id)
                        ->update(['options' => json_encode([...$options, 'allowedFiles' => $stored])]);
                }
            });
    }
};
