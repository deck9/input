<?php

const DELAY_MULTIPLICATOR = 30;
const MAX_DELAY = 1500;

/**
 * calculates if the contrast color of the passed hexcode should be black or white
 *
 * @return string 'black' | 'white'
 */
function getContrastYIQ(string $hexcolor): string
{
    $hexcolor = str_replace('#', '', $hexcolor);

    $r = hexdec(substr($hexcolor, 0, 2));
    $g = hexdec(substr($hexcolor, 2, 2));
    $b = hexdec(substr($hexcolor, 4, 2));
    $yiq = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;

    return ($yiq >= 150) ? '#000000' : '#ffffff';
}

function has_string_keys(array $array)
{
    return count(array_filter(array_keys($array), 'is_string')) > 0;
}

/**
 * public id for a new form, block or interaction, stored once in its uuid column
 */
function hashid(int $id): string
{
    // never the raw app key: a hashids salt can be recovered from enough ids
    $salt = config('app.hashids_salt') ?: hash_hmac('sha256', 'hashids', (string) config('app.key'));

    return (new Hashids\Hashids($salt, 12))->encode($id);
}
