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

    // the editor's maximum of files for a file question
    public const MAX_FILES = 10;

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

        // store allowed files the way the upload reads them, so imported or older values keep saving
        self::saving(function ($model) {
            if ($model->type === FormBlockInteractionType::file && isset($model->options['allowedFiles'])) {
                $model->options = [...$model->options, 'allowedFiles' => self::maxFiles($model->options['allowedFiles'])];
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

    // whole numbers up to the maximum count, a decimal is cut, anything else is the maximum
    public static function maxFiles(mixed $allowedFiles): int
    {
        $files = (int) $allowedFiles;

        return $files >= 1 ? min($files, self::MAX_FILES) : self::MAX_FILES;
    }

    public function formBlock()
    {
        return $this->belongsTo(FormBlock::class, 'form_block_id');
    }

    public function formSessionResponses()
    {
        return $this->hasMany(FormSessionResponse::class, 'form_block_interaction_id');
    }

    public function toTemplate()
    {
        return $this->only(self::TEMPLATE_ATTRIBUTES);
    }
}
