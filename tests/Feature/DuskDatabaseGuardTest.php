<?php

use PHPUnit\Framework\AssertionFailedError;
use Tests\DuskTestCase;

beforeEach(function () {
    $this->browserTest = new class('guard') extends DuskTestCase
    {
        public function guard(): void
        {
            $this->beforeRefreshingDatabase();
        }
    };
});

test('browser tests refuse any database but the dusk sqlite file', function (array $config) {
    config($config);

    expect(fn () => $this->browserTest->guard())->toThrow(AssertionFailedError::class, 'database/dusk.sqlite');
})->with([
    'the MariaDB test database' => [[]],
    'DATABASE_URL pointing at MySQL' => [[
        'database.default' => 'sqlite',
        'database.connections.sqlite.url' => 'mysql://sail:password@mariadb.test/input',
        'database.connections.sqlite.database' => 'database/dusk.sqlite',
    ]],
    'another SQLite file' => [[
        'database.default' => 'sqlite',
        'database.connections.sqlite.database' => '/tmp/notdusk.sqlite',
    ]],
]);

test('browser tests run on the dusk sqlite file', function () {
    config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => 'database/dusk.sqlite']);

    expect(fn () => $this->browserTest->guard())->not->toThrow(AssertionFailedError::class);
});
