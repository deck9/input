<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * SQLite before Laravel 11 skipped foreign keys added to existing tables, and the uploads
     * migration skipped its key on SQLite. Without them, deleting a form kept its answers and uploads.
     */
    private array $foreignKeys = [
        'form_blocks' => ['form_id' => 'forms'],
        'form_block_interactions' => ['form_block_id' => 'form_blocks'],
        'form_sessions' => ['form_id' => 'forms'],
        'form_session_responses' => [
            'form_session_id' => 'form_sessions',
            'form_block_id' => 'form_blocks',
            'form_block_interaction_id' => 'form_block_interactions',
        ],
        'form_session_uploads' => ['form_session_response_id' => 'form_session_responses'],
    ];

    public function up(): void
    {
        // SQLite adds a key by rebuilding the table: with keys on, dropping the old table would cascade,
        // and rows whose parent is already gone would be rejected. They stay as they are.
        Schema::withoutForeignKeyConstraints(fn () => $this->addMissingKeys());
    }

    private function addMissingKeys(): void
    {
        foreach ($this->foreignKeys as $table => $keys) {
            $existing = array_merge(...array_column(Schema::getForeignKeys($table), 'columns'));
            $missing = array_diff_key($keys, array_flip($existing));

            if ($missing === []) {
                continue;
            }

            Schema::table($table, function (Blueprint $table) use ($missing) {
                foreach ($missing as $column => $on) {
                    $table->foreign($column)->references('id')->on($on)->cascadeOnDelete();
                }
            });
        }
    }
};
