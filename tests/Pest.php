<?php

uses(
    Tests\DuskTestCase::class,
    // Illuminate\Foundation\Testing\DatabaseMigrations::class,
)->in('Browser');

uses(Tests\TestCase::class)->in('Feature', 'Unit');
