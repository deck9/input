<?php

use App\Models\Form;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake();
    Storage::put('form/background.jpg', UploadedFile::fake()->image('background.jpg', 64, 64)->get());
    Form::factory()->create(['background_path' => 'form/background.jpg']);
});

test('serves a form image in the variants the form page and the editor use', function (string $query) {
    $this->get('/images/form/background.jpg'.$query)->assertOk();

    expect(Storage::allFiles('.cache'))->toHaveCount(1);
})->with(['', '?w=256&q=75', '?q=75&w=256', '?w=1600&fm=webp', '?w=1920&fm=webp', '?w=2880&fm=webp']);

test('rejects image parameters the form page does not use and stores no file', function (string $query) {
    $this->get('/images/form/background.jpg'.$query)->assertNotFound();

    expect(Storage::allFiles('.cache'))->toBeEmpty();
})->with(['?w=257', '?w=256', '?w=0256&q=75', '?w=1600&fm=png', '?w=1600&fm=webp&blur=5', '?w[]=1600&fm=webp']);

test('serves only form images', function () {
    Storage::put('uploads/1/answer.jpg', UploadedFile::fake()->image('answer.jpg')->get());

    $this->get('/images/uploads/1/answer.jpg')->assertNotFound();
});

test('serves a form image only under its exact path', function (string $path) {
    $this->get('/images/'.$path)->assertNotFound();

    expect(Storage::allFiles('.cache'))->toBeEmpty();
})->with(['form/BACKGROUND.jpg', 'form/background.jpg%20']);

test('limits image requests per visitor', function () {
    for ($i = 0; $i < 120; $i++) {
        $this->get('/images/missing.jpg')->assertNotFound();
    }

    $this->get('/images/missing.jpg')->assertTooManyRequests();
});
