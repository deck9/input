<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function setValueAttribute($new)
    {
        $this->attributes['value'] = encrypt($new);
    }

    public function getValueAttribute()
    {
        try {
            return decrypt($this->attributes['value']);
        } catch (\Throwable $th) {
            return $this->attributes['value'];
        }
    }
}
