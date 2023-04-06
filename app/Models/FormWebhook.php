<?php

namespace App\Models;

use App\Models\Form;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormWebhook extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'headers' => 'array',
        'is_enabled' => 'boolean'
    ];

    protected $appends = [
        'has_provider'
    ];

    protected $hidden = [
        'form_id'
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function hasProvider(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => array_key_exists('provider', $attributes) && $attributes['provider'],
        );
    }
}
