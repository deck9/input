<?php

namespace App\Models;

use Hashids\Hashids;
use Ramsey\Uuid\Uuid;
use App\Models\FormBlock;
use App\Models\FormSession;
use App\Enums\FormBlockType;
use Illuminate\Support\Carbon;
use App\Models\FormIntegration;
use Illuminate\Support\Facades\DB;
use App\Models\Traits\TemplateImports;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\PublicFormResource;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Http\Resources\PublicFormBlockResource;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Form extends Model
{
    use HasFactory, SoftDeletes, TemplateImports;

    const DEFAULT_BRAND_COLOR = '#1f2937';

    const TEMPLATE_ATTRIBUTES = [
        'name',
        'description',
        'eoc_text',
        'eoc_headline',
        'cta_label',
        'cta_link',
        'linkedin',
        'github',
        'instagram',
        'facebook',
        'twitter',
        'show_cta_link',
        'show_social_links',
        'show_form_progress',
    ];

    protected $guarded = [];

    protected $casts = [
        'is_notification_via_mail' => 'boolean',
        'show_cta_link' => 'boolean',
        'show_form_progress' => 'boolean',
        'cta_append_params' => 'boolean',
        'show_social_links' => 'boolean',
        'show_privacy_link' => 'boolean',
        'has_data_privacy' => 'boolean',
        'user_id' => 'integer',
        'published_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $hidden = [
        'user_id',
        'deleted_at',
        'avatar_path',
        'background_path',
        'user',
    ];

    protected $appends = [
        'avatar',
        'background',
        'contrast_color',
        'company_name',
        'company_description',
        'active_privacy_link',
        'active_legal_notice_link',
        'privacy_contact_person',
        'privacy_contact_email',
        'total_sessions',
        'completed_sessions',
        'completion_rate',
        'is_published',
        'initials',
    ];

    protected static function boot()
    {
        parent::boot();

        self::creating(function ($model) {
            $model->uuid = (string) Uuid::uuid4();
        });

        self::created(function ($model) {
            $model->update([
                'uuid' => (new Hashids())->encode($model->id),
            ]);
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')->whereDate('published_at', '<=', Carbon::now());
    }

    public function formIntegrations(): HasMany
    {
        return $this->hasMany(FormIntegration::class);
    }

    public function formBlocks(): HasMany
    {
        return $this->hasMany(FormBlock::class);
    }

    public function formSessions(): HasMany
    {
        return $this->hasMany(FormSession::class);
    }

    public function formSessionResponses(): HasManyThrough
    {
        return $this->hasManyThrough(FormSessionResponse::class, FormBlock::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function route()
    {
        return route('forms.show', $this->uuid);
    }

    public function isEmpty()
    {
        return $this->blocksCount() <= 0;
    }

    public function blocksCount()
    {
        return $this->formBlocks->count();
    }

    public function actionBlocksCount()
    {
        return $this->formBlocks->filter(function ($item) {
            return $item->hasResponseAction();
        })->count();
    }

    public function responsesCount()
    {
        $result = $this->formSessionResponses()
            ->select(DB::raw('count(*) as response_count'))
            ->groupBy('form_block_id')
            ->orderBy('response_count', 'DESC')
            ->limit(1)
            ->first();

        return $result ? $result->response_count : 0;
    }

    public function hasImage($type)
    {
        $fieldname = $type . '_path';

        if (!$this->$fieldname) {
            return false;
        }

        return Storage::exists($this->$fieldname);
    }

    public function getAvatarAttribute()
    {
        if ($this->hasImage('avatar')) {
            return asset('images/' . $this->avatar_path);
        }

        return false;
    }

    public function getBackgroundAttribute()
    {
        if ($this->hasImage('background')) {
            return asset('images/' . $this->background_path);
        }

        return false;
    }

    public function getIsPublishedAttribute()
    {
        return $this->published_at && $this->published_at->isPast();
    }

    public function getCompanyNameAttribute()
    {
        return $this->user->company_name;
    }

    public function getCompanyDescriptionAttribute()
    {
        return $this->user->company_description;
    }

    public function getActivePrivacyLinkAttribute()
    {
        return $this->privacy_link ? $this->privacy_link : $this->user->privacy_link;
    }

    public function getActiveLegalNoticeLinkAttribute()
    {
        return $this->legal_notice_link ?  $this->legal_notice_link : $this->user->legal_notice_link;
    }

    public function getPrivacyContactPersonAttribute()
    {
        return $this->user->privacy_contact_person;
    }

    public function getPrivacyContactEmailAttribute()
    {
        return $this->user->privacy_contact_email;
    }

    public function brandColor()
    {
        return $this->brand_color ? $this->brand_color : '#000000';
    }

    public function getContrastColorAttribute()
    {
        return getContrastYIQ($this->brandColor());
    }

    public function getInitialsAttribute()
    {
        $strings = explode(' ', $this->name)[0];
        return join(
            ' ',
            collect($strings)
                ->take(2)
                ->map(fn ($item) => substr($item, 0, 2))
                ->toArray()
        );
    }

    public function countSessions()
    {
        $blocks = $this->formBlocks->pluck('id')->toArray();

        return FormSessionResponse::select('session')
            ->whereIn('form_block_id', $blocks)
            ->groupBy('session')
            ->get()
            ->count();
    }

    public function getTotalSessionsAttribute()
    {
        return $this->formSessions()
            ->count();
    }

    public function getCompletedSessionsAttribute()
    {
        return $this->formSessions()
            ->whereHas('formSessionResponses')
            ->get()
            ->where('is_completed', true)
            ->count();
    }

    public function getCompletionRateAttribute()
    {
        try {
            return round(($this->completedSessions / $this->totalSessions) * 100, 2);
        } catch (\Throwable $th) {
            return 0;
        }
    }

    public function isOwner(User $user = null)
    {
        return $user ? $user->id === $this->user_id : false;
    }

    public function countSessionsForCurrentMonth()
    {
        $blocks = $this->formBlocks->pluck('id')->toArray();

        return FormSessionResponse::select('*')
            ->whereYear('created_at', '=', Carbon::now())
            ->whereMonth('created_at', '=', Carbon::now())
            ->whereIn('form_block_id', $blocks)
            ->groupBy('session')
            ->get()
            ->count();
    }

    public function getJavascriptConfig()
    {
        $settings = json_encode(PublicFormResource::make($this)->resolve());

        $output = "window.iptSettings = window.iptSettings || [];";
        $output .= "window.iptSettings = {$settings}";

        return $output;
    }

    public function getPublicStoryboard()
    {
        // Filter out blocks that are groups and have no children
        $blocks = $this->formBlocks->filter(function ($item) {
            if ($item->type === FormBlockType::group) {

                return $this->formBlocks->first(function ($child) use ($item) {
                    return $child->parent_block === $item->uuid;
                });
            }

            return true;
        });

        $blockCount = $blocks->count();

        return [
            'count' => $blockCount,
            'blocks' => PublicFormBlockResource::collection($blocks),
        ];
    }
}
