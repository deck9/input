<?php

namespace App\Models;

use App\Enums\FormBlockInteractionType;
use App\Enums\FormBlockType;
use App\Models\Form;
use Hashids\Hashids;
use App\Scopes\Sequence;
use Webpatser\Uuid\Uuid;
use App\Models\FormSessionResponse;
use App\Models\FormBlockInteraction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormBlock extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $with = ['interactions'];

    protected $casts = [
        'responses' => 'array',
        'is_skippable' => 'boolean',
        'is_child' => 'boolean',
        'form_id' => 'integer',
        'options' => 'array',
        'type' => FormBlockType::class,
    ];

    protected $appends = [
        'typing_delay',
    ];

    protected static function boot()
    {
        parent::boot();

        self::addGlobalScope(new Sequence());

        self::creating(function ($model) {
            $model->uuid = (string) Uuid::generate(4);
        });

        self::created(function ($model) {
            $model->update([
                'uuid' => (new Hashids())->encode($model->id),
            ]);
        });
    }

    public function scopeWithUuid($query, $value)
    {
        return $query->where('uuid', $value);
    }

    public function scopeOnlyInteractive($query)
    {
        return $query->whereNotIn('type', [
            FormBlockType::none
        ]);
    }

    public function hasResponseAction()
    {
        return !in_array($this->type, [FormBlockType::none]);
    }

    public function hasInput()
    {
        return $this->type === 'input';
    }

    public function interactions()
    {
        return $this->hasMany(FormBlockInteraction::class, 'form_block_id');
    }

    public function activeInteractions()
    {
        return $this->hasMany(FormBlockInteraction::class, 'form_block_id')
            ->where('type', $this->getInteractionType());
    }

    public function responses()
    {
        return $this->hasMany(FormSessionResponse::class);
    }

    public function form()
    {
        return $this->belongsTo(Form::class, 'form_id');
    }

    public function getTypingDelayAttribute()
    {
        return $this->typingDelay();
    }

    public function typingDelay()
    {
        return typingDelay($this->message);
    }


    public function getInteractionType(): FormBlockInteractionType | null
    {
        switch ($this->type) {
            case FormBlockType::short:
            case FormBlockType::email:
            case FormBlockType::phone:
            case FormBlockType::link:
            case FormBlockType::number:
                return FormBlockInteractionType::input;

            case FormBlockType::checkbox:
            case FormBlockType::radio:
                return FormBlockInteractionType::button;

            case FormBlockType::consent:
                return FormBlockInteractionType::consent;

            default:
                return null;
        }
    }

    public function updateInteractionSequence(array $sequence)
    {
        foreach ($sequence as $pos => $id) {
            $interaction = $this->interactions->firstWhere('id', $id);
            $interaction->update(['sequence' => $pos]);
        }
    }

    public function getPublicJson()
    {
        return [
            'id' => $this->uuid,
            'type' => $this->type->value,
            'title' => $this->title,
            'message' => $this->message,
            'interactions' => $this->activeInteractions->map(function ($interaction) {
                return $interaction->getPublicJson();
            })->toArray(),
        ];
    }
}
