<?php

use App\Models\FormBlock;

const DELAY_MULTIPLICATOR = 30;
const MAX_DELAY = 1500;

/**
 * calculates if the contrast color of the passed hexcode should be black or white
 *
 * @param string $hexcolor
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
