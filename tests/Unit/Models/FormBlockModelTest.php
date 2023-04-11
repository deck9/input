<?php

use App\Models\FormBlock;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('the to array method should return the correct fields', function () {
    $block = FormBlock::factory()->create();

    expect($block->toArray())->toHaveKey('id');
    expect($block->toArray())->toHaveKey('type');
    expect($block->toArray())->toHaveKey('message');
});

test('has scope to get snippet by uuid', function () {
    $block = FormBlock::factory()->create();

    $result = FormBlock::withUuid($block->uuid)->first();

    expect($result->id)->toEqual($block->id);
});
