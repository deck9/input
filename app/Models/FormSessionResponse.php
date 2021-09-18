<?php

namespace App\Models;

use App\Models\FormBlock;
use App\Models\FormSession;
use App\Scopes\WithoutChildren;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

    public function block()
    {
        return $this->belongsTo(FormBlock::class, 'form_block_id')
            ->withoutGlobalScope(WithoutChildren::class);
    }

    public function session()
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
