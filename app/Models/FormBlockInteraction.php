<?php

namespace App\Models;

use App\Scopes\Sequence;
use Illuminate\Support\Str;
use App\Enums\FormBlockInteractionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormBlockInteraction extends BaseModel
{
    use HasFactory;

    public const TEMPLATE_ATTRIBUTES = [
        'type',
        'name',
        'is_editable',
        'is_disabled',
        'label',
        'options',
        'message',
        'sequence',
    ];

    protected $guarded = [];

    protected $casts = [
        'form_block_id' => 'integer',
        'type' => FormBlockInteractionType::class,
        'options' => 'array',
        'is_editable' => 'boolean',
        'is_disabled' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        self::addGlobalScope(new Sequence());

        // random public id, not derived from the row id; stored ids never change
        self::creating(function ($model) {
            $model->uuid = Str::random(16);

            if (! $model->sequence) {
                $model->sequence = self::where('form_block_id', $model->form_block_id)->count();
            }
        });

        self::deleted(function ($model) {

            $model->formBlock->updateInteractionSequence(
                self::where('form_block_id', $model->form_block_id)
                    ->where('type', $model->type)
                    ->pluck('id')
                    ->toArray()
            );
        });
    }

    public function formBlock()
    {
        return $this->belongsTo(FormBlock::class, 'form_block_id');
    }

    public function formSessionResponses()
    {
        return $this->hasMany(FormSessionResponse::class, 'form_block_interaction_id');
    }

    public function getResponsesCountAttribute()
    {
        return $this->formSessionResponses->count();
    }

    public function toTemplate()
    {
        return $this->only(self::TEMPLATE_ATTRIBUTES);
    }
}
