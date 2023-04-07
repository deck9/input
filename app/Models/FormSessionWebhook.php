<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormSessionWebhook extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'response' => 'json',
    ];

    public function webhook()
    {
        return $this->belongsTo(FormWebhook::class, 'form_webhook_id');
    }
}
