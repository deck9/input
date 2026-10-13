<?php

namespace App\Models;

use App\Scopes\Sequence;
use Illuminate\Support\Str;
use App\Enums\FormBlockType;
use Illuminate\Support\Facades\DB;
use App\Models\FormBlockLogic;
use App\Enums\FormBlockInteractionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormBlock extends BaseModel
{
    use HasFactory;

    public const TEMPLATE_ATTRIBUTES = [
        'type',
        'message',
        'title',
        'options',
        'is_required',
        'is_disabled',
        'parent_block',
        'sequence',
    ];

    protected $guarded = [];

    protected $with = ['formBlockInteractions', 'formBlockLogics'];

    protected $casts = [
        'is_required' => 'boolean',
        'is_disabled' => 'boolean',
        'form_id' => 'integer',
        'options' => 'array',
        'type' => FormBlockType::class,
    ];

    protected $appends = [
        'interactions',
        'logics',
    ];

    protected $hidden = [
        'formBlockInteractions',
        'formBlockLogics',
    ];

    protected static function boot()
    {
        parent::boot();

        self::addGlobalScope(new Sequence());

        // random public id, not derived from the row id; stored ids never change
        self::creating(function ($model) {
            $model->uuid = Str::random(16);
        });
    }

    public function scopeOnlyInteractive($query)
    {
        return $query->whereNotIn('type', [
            FormBlockType::none,
        ]);
    }

    public function hasResponseAction()
    {
        return ! in_array($this->type, [FormBlockType::none]);
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

    public function formBlockLogics()
    {
        return $this->hasMany(FormBlockLogic::class, 'form_block_id');
    }

    public function activeInteractions()
    {
        return $this->hasMany(FormBlockInteraction::class, 'form_block_id')
            ->where('type', $this->getInteractionType())
            ->where('is_disabled', false)
            ->orderBy('name', 'asc');
    }

    public function getInteractionsAttribute()
    {
        return $this->formBlockInteractions;
    }

    public function getLogicsAttribute()
    {
        return $this->formBlockLogics;
    }

    public function getSessionCountAttribute()
    {
        return $this->formSessionResponses()->distinct()->count('form_session_id');
    }

    public function getInteractionType(): ?FormBlockInteractionType
    {
        switch ($this->type) {
            case FormBlockType::short:
            case FormBlockType::email:
            case FormBlockType::phone:
            case FormBlockType::link:
            case FormBlockType::number:
            case FormBlockType::secret:
                return FormBlockInteractionType::input;

            case FormBlockType::long:
                return FormBlockInteractionType::textarea;

            case FormBlockType::file:
                return FormBlockInteractionType::file;

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

    public function duplicate(): FormBlock
    {
        return DB::transaction(function () {
            // duplicates at the same time wait here, else they renumber over each other or deadlock
            $this->form()->lockForUpdate()->first();

            $blocks = $this->form->formBlocks()->get();

            // the Identifier names the answer in prefill links and webhooks, so the copy has none
            $copy = $this->form->formBlocks()->create([...$this->only(self::TEMPLATE_ATTRIBUTES), 'title' => null]);

            $this->formBlockInteractions->each(
                fn ($interaction) => $copy->formBlockInteractions()->create($interaction->only(FormBlockInteraction::TEMPLATE_ATTRIBUTES))
            );

            // renumber the whole form, as older forms can have gaps and two blocks on one position
            $blocks->splice($blocks->search(fn ($block) => $block->is($this)) + 1, 0, [$copy]);
            $blocks->each(fn ($block, $position) => $block->update(['sequence' => $position]));

            return $copy;
        });
    }

    public function toTemplate()
    {
        $attributes = $this->only(self::TEMPLATE_ATTRIBUTES);

        // children point to their group, and logic rules to any block, by this id
        $attributes['id'] = $this->uuid;

        $interactions = $this->formBlockInteractions->map(function ($interactions) {
            return $interactions->toTemplate();
        })->toArray();

        $logics = $this->formBlockLogics->map->toTemplate()->toArray();

        return array_merge($attributes, [
            'formBlockInteractions' => $interactions,
            'formBlockLogics' => $logics,
        ]);
    }

    public function submit(FormSession $session, array $data)
    {
        if (! has_string_keys($data)) {
            collect($data)->each(fn ($chunk) => $this->submit($session, $chunk));
        } else {
            $interaction = $this->formBlockInteractions()
                ->withUuid($data['actionId'])
                ->firstOrFail();

            return $session->formSessionResponses()->updateOrCreate([
                'form_block_id' => $this->id,
                'form_block_interaction_id' => $interaction->id,
            ], [
                'value' => $data['payload'],
            ]);
        }
    }

    public function getSubmitPayload(string|array $payload)
    {
        if (is_array($payload)) {
            $action = collect($payload)->map(function ($index) {
                $action = $this->formBlockInteractions[$index];

                return [
                    'actionId' => $action->uuid,
                    'payload' => $action->label,
                ];
            })->toArray();
        } elseif (is_string($payload)) {
            $action = [
                'actionId' => $this->formBlockInteractions[0]->uuid,
                'payload' => $payload,
            ];
        }

        return [
            $this->uuid => $action,
        ];
    }
}
