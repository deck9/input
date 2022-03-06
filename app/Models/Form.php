<?php

namespace App\Models;

use Hashids\Hashids;
use Ramsey\Uuid\Uuid;
use App\Models\FormBlock;
use App\Models\FormSession;
use App\Enums\FormBlockType;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Form extends Model
{
    use HasFactory, SoftDeletes;

    const DEFAULT_BRAND_COLOR = '#1C44E3';

    protected $guarded = [];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'is_notification_via_mail' => 'boolean',
        'show_cta_link' => 'boolean',
        'show_social_links' => 'boolean',
        'show_privacy_link' => 'boolean',
        'has_data_privacy' => 'boolean',
        'user_id' => 'integer',
        'published_at' => 'datetime'
    ];

    protected $hidden = [
        'user_id',
        'deleted_at',
        'avatar_path',
        'user',
    ];

    protected $appends = [
        'avatar',
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

    public function scopeWithUuid($query, $value)
    {
        return $query->where('uuid', $value);
    }

    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')->whereDate('published_at', '<=', Carbon::now());
    }

    public function blocks()
    {
        return $this->hasMany(FormBlock::class);
    }

    public function sessions()
    {
        return $this->hasMany(FormSession::class);
    }

    public function responses()
    {
        return $this->hasManyThrough(FormSessionResponse::class, FormBlock::class);
    }

    public function user()
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
        return $this->blocks->count();
    }

    public function actionBlocksCount()
    {
        return $this->blocks->filter(function ($item) {
            return $item->hasResponseAction();
        })->count();
    }

    public function responsesCount()
    {
        $result = $this->responses()
            ->select(DB::raw('count(*) as response_count'))
            ->groupBy('form_block_id')
            ->orderBy('response_count', 'DESC')
            ->limit(1)
            ->first();

        return $result ? $result->response_count : 0;
    }

    public function hasAvatar()
    {
        if (!$this->avatar_path) {
            return false;
        }

        return Storage::disk('images')->exists($this->avatar_path);
    }

    public function avatarImage()
    {
        if ($this->hasAvatar()) {
            return url('images/' . $this->avatar_path);
        }

        return false;
    }

    public function getAvatarAttribute()
    {
        return $this->avatarImage();
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
        $blocks = $this->blocks->pluck('id')->toArray();

        return FormSessionResponse::select('session')
            ->whereIn('form_block_id', $blocks)
            ->groupBy('session')
            ->get()
            ->count();
    }

    public function getTotalSessionsAttribute()
    {
        return $this->sessions()
            ->whereHas('responses')
            ->count();
    }

    public function getCompletedSessionsAttribute()
    {
        return $this->sessions()
            ->whereHas('responses')
            ->get()
            ->where('is_completed', true)
            ->count();
    }

    public function getCompletionRateAttribute()
    {
        try {
            return round(($this->completedSessions() / $this->totalSessions()) * 100, 2);
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
        $blocks = $this->blocks->pluck('id')->toArray();

        return FormSessionResponse::select('*')
            ->whereYear('created_at', '=', Carbon::now())
            ->whereMonth('created_at', '=', Carbon::now())
            ->whereIn('form_block_id', $blocks)
            ->groupBy('session')
            ->get()
            ->count();
    }

    public function createDefaultConsent()
    {
        FormBlock::create([
            'type' => FormBlockType::consent,
            'form_id' => $this->id,
        ]);
    }

    public function getJavascriptConfig()
    {
        $settings = $this->toJson();

        $output = "window.iptSettings = window.iptSettings || [];";
        $output .= "window.iptSettings = ${settings}";

        return $output;
    }
}
