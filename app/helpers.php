<?php

use App\Models\FormBlock;

const DELAY_MULTIPLICATOR = 30;
const MAX_DELAY = 1500;

/**
 * calculates a delay in milliseconds by counting string length and
 * multiplying it with a constant factor.
 *
 * @param string $message
 *
 * @return int
 */
function typingDelay($message, $max_delay = MAX_DELAY): int
{
    return min($max_delay, strlen(strip_tags($message)) * DELAY_MULTIPLICATOR);
}

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

function injectNestedSnippets($originalSnippets)
{
    $snippets = [];

    foreach ($originalSnippets as $key => $snippet) {
        try {
            if (!$snippet->responses) {
                $snippets[] = $snippet->toArray();
                continue;
            }
        } catch (\Exception $e) {
            continue;
        }

        $transformedResponses = [];

        foreach ($snippet->responses as $response) {
            $tempResponse = [];

            if (array_key_exists('reaction', $response) && !is_null($response['reaction'])) {
                $reaction = FormBlock::withUuid($response['reaction'])->first();
                $tempResponse['reaction'] = $reaction->toArray();
            }

            if (array_key_exists('children', $response) && !empty($response['children'])) {
                $children = [];
                foreach ($response['children'] as $child) {
                    $children[] = FormBlock::withUuid($child)->first();
                }
                $tempResponse['children'] = injectNestedSnippets($children);
            }

            $transformedResponses[] = array_merge($response, $tempResponse);
        }

        $snippets[] = array_merge($snippet->toArray(), ['responses' => $transformedResponses]);
    }

    return $snippets;
}

function has_string_keys(array $array)
{
    return count(array_filter(array_keys($array), 'is_string')) > 0;
}
