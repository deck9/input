<?php

namespace App\Enums;

enum FormBlockInteractionType: string
{
    case input = 'input';
    case textarea = 'textarea';
    case button = 'button';
    case consent = 'consent';
    case file = 'file';

    case range = 'range';

    case date = 'date';
}
