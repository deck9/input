<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FormSessionResponse extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'id' => 'integer',
        'form_block_id' => 'integer',
        'form_block_interaction_id' => 'integer',
        'form_session_id' => 'integer',
    ];

    public function scopeOfSession($query, $token)
    {
        return $query->where('token', $token);
    }

    public function formBlock()
    {
        return $this->belongsTo(FormBlock::class, 'form_block_id');
    }

    public function formBlockInteraction()
    {
        return $this->belongsTo(FormBlockInteraction::class, 'form_block_interaction_id');
    }

    public function formSession()
    {
        return $this->belongsTo(FormSession::class, 'form_session_id');
    }

    public function formSessionUploads()
    {
        return $this->hasMany(FormSessionUpload::class);
    }

    public function setValueAttribute($new)
    {
        $this->attributes['value'] = config('app.debug') ? json_encode($new) : encrypt($new);
    }

    public function getValueAttribute()
    {
        try {
            return config('app.debug') ? json_decode($this->attributes['value'], true) : decrypt($this->attributes['value']);
        } catch (\Throwable $th) {
            return $this->attributes['value'];
        }
    }

    public function saveUpload(UploadedFile $file, int $maxFiles = PHP_INT_MAX)
    {
        // stored before the lock, so the lock only covers the count and the row
        $path = $file->store(implode('/', ['uploads', $this->id]));

        try {
            return DB::transaction(function () use ($file, $path, $maxFiles) {
                // a write first locks this answer: its row on MariaDB, the database on SQLite,
                // where lockForUpdate does nothing and a count before the first write can't wait
                static::whereKey($this->id)->touch();

                if ($this->formSessionUploads()->count() >= $maxFiles) {
                    throw ValidationException::withMessages(['file' => "This question takes at most {$maxFiles} files."]);
                }

                return $this->formSessionUploads()->create([
                    'uuid' => Str::uuid(),
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);
            });
        } catch (\Throwable $e) {
            Storage::delete($path);

            throw $e;
        }
    }
}
