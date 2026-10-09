<?php

use App\Models\Form;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('new forms, blocks and interactions get random ids of 16 characters', function () {
    $interaction = FormBlockInteraction::factory()->create();

    collect([$interaction, $interaction->formBlock, $interaction->formBlock->form])->each(function ($model) {
        expect($model->uuid)->toMatch('/^[a-zA-Z0-9]{16}$/')
            ->and($model->fresh()->uuid)->toBe($model->uuid);
    });
});

test('an existing form keeps its stored id and public link', function () {
    $form = Form::factory()->create();
    $legacyId = 'jR'; // old ids were short hashids, e.g. id 1 => jR
    $form->update(['uuid' => $legacyId]);

    $this->get(route('forms.show', $legacyId))->assertStatus(200);

    $this->json('get', route('api.public.forms.show', $legacyId))
        ->assertStatus(200)
        ->assertJsonPath('uuid', $legacyId);
});
