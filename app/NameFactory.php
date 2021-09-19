<?php

namespace App;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class NameFactory
{
    const ADJECTIVES = [
        "brave",
        "clever",
        "friendly",
        "funny",
        "chatty",
        "grumpy",
        "honest",
        "lazy",
        "moody",
        "nice",
        "serious",
        "wise",
    ];

    const NAMES = [
        "Dave",
        "Charles",
        "Edward",
        "Gustav",
        "Rudolf",
        "Lina",
        "Klaus",
        "Pete",
        "Walter",
        "Joe",
        "Marlene",
        "Sina",
        "Emma",
        "Lauren",
        "Elli",
        "Han",
        "Chewbacca",
        "Luke",
        "Frodo",
        "Tony",
        "Thor",
        "Jessica",
        "Lara",
    ];


    public static function generate()
    {
        return Str::title(
            Arr::random(self::ADJECTIVES)
                . ' '
                .  Arr::random(self::NAMES)
        );
    }
}
