<?php

namespace App\Models;

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

    public const MESSAGE = 'none';
    public const CLICK = 'click';
    public const INPUT = 'input';
    public const MULTIPLE = 'multiple';
    public const CONSENT = 'consent';

    protected $guarded = [];

    protected $with = ['interactions'];

    protected $casts = [
        'responses' => 'array',
        'is_skippable' => 'boolean',
        'is_child' => 'boolean',
        'chatbot_id' => 'integer',
        'options' => 'array',
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
        return $query->whereIn('type', [self::CLICK, self::INPUT]);
    }

    public function hasResponseAction()
    {
        return in_array($this->type, [self::CLICK, self::INPUT]);
    }

    public function hasInput()
    {
        return $this->type === 'input';
    }

    public function interactions()
    {
        return $this->hasMany(FormBlockInteraction::class);
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
}
