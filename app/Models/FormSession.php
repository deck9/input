<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class FormSession extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'params' => 'array',
        'is_completed' => 'boolean',
        'has_data_privacy' => 'boolean',
    ];

    protected $hidden = [
        'id', 'form_id', 'updated_at',
    ];

    protected $appends = [
        'is_completed',
    ];

    protected static function booted(): void
    {
        static::deleting(function (FormSession $session) {
            $session->responses->each(function (FormSessionResponse $response) {
                $response->formSessionUploads->each(function (FormSessionUpload $upload) {
                    Storage::delete($upload->path);
                });
            });
        });
    }

    public function form()
    {
        return $this->belongsTo(Form::class, 'form_id', 'id');
    }

    public function webhooks()
    {
        return $this->hasMany(FormSessionWebhook::class);
    }

    public function responses()
    {
        return $this->hasMany(FormSessionResponse::class);
    }

    public static function getByTokenAndForm(string $token, Form $form)
    {
        return self::where('token', $token)->where('form_id', $form->id)->first();
    }

    public function isActive()
    {
        return Carbon::now()->diffInMinutes($this->updated_at) <= 120;
    }

    public function formSessionResponses()
    {
        return $this->hasMany(FormSessionResponse::class);
    }

    public function getIsCompletedAttribute(): bool
    {
        if (array_key_exists('is_completed', $this->attributes)) {
            return ! is_null($this->original['is_completed']);
        }

        return false;
    }

    public function submit($payload)
    {
        foreach ($payload as $blockUuid => $blockPayload) {
            $block = FormBlock::withUuid($blockUuid)->firstOrFail();
            $block->submit($this, $blockPayload);
        }

        $this->update(['is_completed' => now()]);

        return $this;
    }
}
