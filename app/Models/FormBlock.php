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

    public const TEMPLATE_ATTRIBUTES = [
        'message',
        'type',
        'title',
        'parent_block',
        'sequence'
    ];

    protected $guarded = [];

    protected $with = ['formBlockInteractions'];

    protected $casts = [
        'is_required' => 'boolean',
        'form_id' => 'integer',
        'options' => 'array',
        'type' => FormBlockType::class,
    ];

    protected $appends = [
        'interactions',
    ];

    protected $hidden = [
        'formBlockInteractions'
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

    public function formSessionResponses()
    {
        return $this->hasMany(FormSessionResponse::class);
    }

    public function form()
    {
        return $this->belongsTo(Form::class, 'form_id');
    }

    public function formBlockInteractions()
    {
        return $this->hasMany(FormBlockInteraction::class, 'form_block_id');
    }

    public function activeInteractions()
    {
        return $this->hasMany(FormBlockInteraction::class, 'form_block_id')
            ->where('type', $this->getInteractionType())
            ->where('is_disabled', false);
    }

    public function getInteractionsAttribute()
    {
        return $this->formBlockInteractions;
    }

    public function getSessionCountAttribute()
    {
        return $this->formSessionResponses()->selectRaw("COUNT(DISTINCT form_session_id) as count")->first()->count;
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

            case FormBlockType::long:
                return FormBlockInteractionType::textarea;

            case FormBlockType::checkbox:
            case FormBlockType::radio:
                return FormBlockInteractionType::button;

            case FormBlockType::consent:
                return FormBlockInteractionType::consent;

            case FormBlockType::rating:
            case FormBlockType::scale:
                return FormBlockInteractionType::range;

            case FormBlockType::date:
                return FormBlockInteractionType::date;

            default:
                return null;
        }
    }

    public function updateInteractionSequence(array $sequence)
    {
        foreach ($sequence as $pos => $id) {
            $interaction = $this->formBlockInteractions->firstWhere('id', $id);
            $interaction->update(['sequence' => $pos]);
        }
    }

    public function toTemplate()
    {
        $blocks = $this->only(self::TEMPLATE_ATTRIBUTES);

        $interactions = $this->formBlockInteractions->map(function ($interactions) {
            return $interactions->toTemplate();
        })->toArray();

        return array_merge($blocks, [
            'formBlockInteractions' => $interactions,
        ]);
    }

    public function submit(FormSession $session, array $data)
    {
        if (!has_string_keys($data)) {
            collect($data)->each(fn ($chunk) => $this->submit($session, $chunk));
        } else {
            $interaction = $this->formBlockInteractions()
                ->withUuid($data['actionId'])
                ->firstOrFail();

            return $session->formSessionResponses()->create([
                'form_block_id' => $this->id,
                'form_block_interaction_id' => $interaction->id,
                'value' => $data['payload'],
            ]);
        }
    }
}
