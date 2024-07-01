<?php

namespace App\Enums;

enum FormBlockType: string
{
    case none = 'none';
    case group = 'group';

    case consent = 'consent';

    case checkbox = 'checkbox';
    case radio = 'radio';

    case file = 'input-file';

    case long = 'input-long';
    case short = 'input-short';
    case email = 'input-email';
    case link = 'input-link';
    case number = 'input-number';
    case phone = 'input-phone';
    case secret = 'input-secret';

    case rating = 'rating';
    case scale = 'scale';

    case date = 'date';
}
