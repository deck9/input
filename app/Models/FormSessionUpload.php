<?php

namespace App\Models;

use Illuminate\Support\Facades\URL;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormSessionUpload extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['download_url'];

    public function formSessionResponse()
    {
        return $this->belongsTo(FormSessionResponse::class);
    }

    public function downloadUrl(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => URL::temporarySignedRoute('forms.submission-uploads.download', now()->addDays(7), $attributes['uuid'])
        );
    }
}
