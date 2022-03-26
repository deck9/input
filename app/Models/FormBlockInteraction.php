<?php

namespace App\Models;

use App\Enums\FormBlockInteractionType;
use Hashids\Hashids;
use Ramsey\Uuid\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormBlockInteraction extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'form_block_id' => 'integer',
        'type' => FormBlockInteractionType::class
    ];

    protected $hidden = [
        'responses',
    ];

    protected static function boot()
    {
        parent::boot();

        self::creating(function ($model) {
            $model->uuid = Uuid::uuid4();

            if (!$model->sequence) {
                $model->sequence = self::where('form_block_id', $model->form_block_id)->count();
            }
        });

        self::created(function ($model) {
            $model->update([
                'uuid' => (new Hashids())->encode($model->id),
            ]);
        });

        self::deleted(function ($model) {;
            $model->block->updateInteractionSequence(
                self::where("form_block_id", $model->form_block_id)
                    ->where('type', $model->type)
                    ->pluck('id')
                    ->toArray()
            );
        });
    }

    public function block()
    {
        return $this->belongsTo(FormBlock::class, 'form_block_id');
    }

    public function responses()
    {
        return $this->hasMany(FormSessionResponse::class);
    }

    public function getResponsesCountAttribute()
    {
        return $this->responses->count();
    }

    public function getPublicJson()
    {
        return [
            'id' => $this->uuid,
            'type' => $this->type->value,
            'label' => $this->label,
            'reply' => $this->reply,
        ];
    }

    public function toTemplate()
    {
        return $this->only([
            'type',
            'label',
            'reply',
            'sequence'
        ]);
    }
}
