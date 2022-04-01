<?php

namespace App\Models;

use App\Models\Form;
use Illuminate\Support\Carbon;
use App\Models\FormSessionResponse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        "id", "form_id", "updated_at",
    ];

    protected $appends = [
        "is_completed",
    ];

    public function form()
    {
        return $this->belongsTo(Form::class, 'form_id', 'id');
    }

    public static function getByTokenAndForm(String $token, Form $form)
    {
        return self::where('token', $token)->where('form_id', $form->id)->first();
    }

    public function isActive()
    {
        return Carbon::now()->diffInMinutes($this->updated_at) <= 120;
    }

    public function responses()
    {
        return $this->hasMany(FormSessionResponse::class);
    }

    public function getIsCompletedAttribute(): bool
    {
        if (array_key_exists('is_completed', $this->attributes)) {
            return !is_null($this->original['is_completed']);
        }

        return false;
    }

    public function submit($payload)
    {
        foreach ($payload as $blockUuid => $blockPayload) {
            $block = FormBlock::where('uuid', $blockUuid)->firstOrFail();
            $block->submit($this, $blockPayload);
        }

        return true;
    }
}
