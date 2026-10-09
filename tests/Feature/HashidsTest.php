<?php

use App\Models\Form;
use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use Hashids\Hashids;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('new forms, blocks and interactions get salted ids of at least 12 characters', function () {
    $interaction = FormBlockInteraction::factory()->create();

    collect([$interaction, $interaction->formBlock, $interaction->formBlock->form])->each(function ($model) {
        expect(strlen($model->uuid))->toBeGreaterThanOrEqual(12)
            ->and($model->uuid)->toBe(hashid($model->id))
            ->and($model->uuid)->not->toBe((new Hashids())->encode($model->id));
    });
});

test('the salt is derived from the app key, never the raw app key', function () {
    expect(hashid(5))
        ->toBe((new Hashids(hash_hmac('sha256', 'hashids', config('app.key')), 12))->encode(5))
        ->not->toBe((new Hashids(config('app.key'), 12))->encode(5));
});

test('a configured salt is used instead of the derived one', function () {
    config(['app.hashids_salt' => 'my-own-salt']);

    expect(hashid(5))->toBe((new Hashids('my-own-salt', 12))->encode(5));
});

test('an existing form keeps its stored id and public link', function () {
    $form = Form::factory()->create();
    $legacyId = (new Hashids())->encode($form->id);
    $form->update(['uuid' => $legacyId]);

    $this->get(route('forms.show', $legacyId))->assertStatus(200);

    $this->json('get', route('api.public.forms.show', $legacyId))
        ->assertStatus(200)
        ->assertJsonPath('uuid', $legacyId);
});
