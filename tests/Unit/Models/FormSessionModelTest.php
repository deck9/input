<?php

use App\Models\FormSession;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a session is active for 120 minutes after its last update', function () {
    $session = FormSession::factory()->create();

    $this->travel(119)->minutes();
    expect($session->isActive())->toBeTrue();

    $this->travel(2)->minutes();
    expect($session->isActive())->toBeFalse();
});
