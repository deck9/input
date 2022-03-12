<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->foreignId('current_team_id')->nullable();
            $table->string('profile_photo_path', 2048)->nullable();
            $table->string('salt')->nullable();
            $table->string('company_name')->nullable();
            $table->string('company_description')->nullable();
            $table->string('privacy_contact_person')->nullable();
            $table->string('privacy_contact_email')->nullable();
            $table->string('privacy_link')->nullable();
            $table->string('legal_notice_link')->nullable();
            $table->timestamps();
        });
    }
}
