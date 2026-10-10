<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('form_sessions', function (Blueprint $table) {
            $table->index(['form_id', 'token']);
        });

        Schema::table('form_session_responses', function (Blueprint $table) {
            $table->index(['form_session_id', 'form_block_id', 'form_block_interaction_id'], 'form_session_responses_lookup_index');
        });

        // on MySQL the foreign key already indexes this column
        if (! Schema::hasIndex('form_session_uploads', ['form_session_response_id'])) {
            Schema::table('form_session_uploads', function (Blueprint $table) {
                $table->index('form_session_response_id');
            });
        }
    }

    public function down(): void
    {
        // MySQL now uses the new indexes for its foreign keys, so those get their own index back first
        $hasForeignKeys = DB::getDriverName() !== 'sqlite';

        Schema::table('form_sessions', function (Blueprint $table) use ($hasForeignKeys) {
            if ($hasForeignKeys) {
                $table->index('form_id', 'form_sessions_form_id_foreign');
            }
            $table->dropIndex(['form_id', 'token']);
        });

        Schema::table('form_session_responses', function (Blueprint $table) use ($hasForeignKeys) {
            if ($hasForeignKeys) {
                $table->index('form_session_id', 'form_session_responses_form_session_id_foreign');
            }
            $table->dropIndex('form_session_responses_lookup_index');
        });

        if (Schema::hasIndex('form_session_uploads', 'form_session_uploads_form_session_response_id_index')) {
            Schema::table('form_session_uploads', function (Blueprint $table) {
                $table->dropIndex(['form_session_response_id']);
            });
        }
    }
};
