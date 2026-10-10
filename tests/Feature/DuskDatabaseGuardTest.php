<?php

use PHPUnit\Framework\AssertionFailedError;
use Tests\DuskTestCase;

test('browser tests migrate only the dusk sqlite file', function () {
    $browserTest = new class('guard') extends DuskTestCase
    {
        public function guard(): void
        {
            $this->beforeRefreshingDatabase();
        }
    };

    expect(fn () => $browserTest->guard())->toThrow(AssertionFailedError::class, 'database/dusk.sqlite');

    config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => 'database/dusk.sqlite']);

    $browserTest->guard();
});
