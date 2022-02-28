<?php

namespace App\Enums;

enum FormBlockInteractionType: string
{
    case input = "input";
    case button = "button";
    case consent = "consent";
}
