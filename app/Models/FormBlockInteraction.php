<?php

namespace App\Models;

use Hashids\Hashids;
use Ramsey\Uuid\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormBlockInteraction extends Model
{
    use HasFactory;

    protected $guarded = [];

    const TYPE_CLICK = 'click';
    const TYPE_INPUT = 'input';
    const TYPE_MULTIPLE = 'multiple';
    const TYPE_CONSENT = 'consent';

    protected $casts = [
        'block_id' => 'integer',
    ];

    protected $hidden = [
        'responses',
    ];

    protected static function boot()
    {
        parent::boot();

        self::creating(function ($model) {
            $model->uuid = Uuid::uuid4();
        });

        self::created(function ($model) {
            $model->update([
                'uuid' => (new Hashids())->encode($model->id),
            ]);
        });
    }

    public function block()
    {
        return $this->belongsTo(FormBlock::class);
    }

    public function responses()
    {
        return $this->hasMany(FormSessionResponse::class);
    }

    public function getResponsesCountAttribute()
    {
        return $this->responses->count();
    }
}
