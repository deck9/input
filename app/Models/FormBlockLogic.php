<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormBlockLogic extends Model
{
    use HasFactory;

    public const TEMPLATE_ATTRIBUTES = [
        'name',
        'conditions',
        'action',
        'action_payload',
        'evaluate',
    ];

    protected $guarded = [];

    protected $casts = [
        'conditions' => 'array',
        'action_payload' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        self::creating(function ($model) {
            $model->uuid = (string) Str::orderedUuid();
        });
    }

    public function formBlock()
    {
        return $this->belongsTo(FormBlock::class);
    }

    public function toTemplate()
    {
        return $this->only(self::TEMPLATE_ATTRIBUTES);
    }
}
