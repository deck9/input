<?php

use App\Models\Form;
use App\Models\FormSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('can create a new form', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();

    $this->withoutExceptionHandling();

    $this->actingAs($user)
        ->post(route('api.forms.create'))
        ->assertSuccessful();

    $form = Form::get()->last();

    $this->assertEquals($user->id, $form->user_id);
    $this->assertNotNull($form->name);
});

test('can create a form with a name', function () {
    $user = User::factory()->withTeam()->create();

    $this->actingAs($user)
        ->post(route('api.forms.create'), [
            'name' => 'Test Form',
        ])
        ->assertSuccessful();

    $form = Form::get()->last();

    $this->assertEquals('Test Form', $form->name);
});

test('when creating a new form the data privacy mode should not be enabled', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();

    $this->actingAs($user)->post(route('api.forms.create'));
    $form = Form::get()->last();

    $this->assertFalse($form->has_data_privacy);
});

test('a new form should have a default brand color set', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();

    $this->actingAs($user)->post(route('api.forms.create'));
    $form = Form::get()->last();

    $this->assertEquals(Form::DEFAULT_BRAND_COLOR, $form->brand_color);
});

test('a user can return all the forms in his account', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();
    $form = Form::factory()->create([
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    $response = $this->actingAs($user)->get(route('api.forms.index'))
        ->assertStatus(200);

    $this->assertEquals($form->uuid, $response->json()[0]['uuid']);
});

test('a team member can view all forms of his team', function () {
    $user = User::factory()->withTeam()->create();
    $member = User::factory()->withTeam($user->currentTeam)->create();
    $form = Form::factory()->create([
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    $response = $this->actingAs($member)->get(route('api.forms.index'))
        ->assertStatus(200);

    $this->assertEquals($form->uuid, $response->json()[0]['uuid']);
});

test('a user can filter for published/unpublished/trashed forms', function () {
    $user = User::factory()->withTeam()->create();

    // published form
    $formA = Form::factory()->create([
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    // unpublished form
    $formB = Form::factory()->unpublished()->create([
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    // deleted form
    $formC = Form::factory()->deleted()->create([
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    $this->actingAs($user)
        ->get(route('api.forms.index', ['filter' => 'published']))
        ->assertStatus(200)
        ->assertJsonFragment(['uuid' => $formA->uuid]);

    $this->actingAs($user)
        ->get(route('api.forms.index', ['filter' => 'unpublished']))
        ->assertStatus(200)
        ->assertJsonFragment(['uuid' => $formB->uuid]);

    $this->actingAs($user)
        ->get(route('api.forms.index', ['filter' => 'trashed']))
        ->assertStatus(200)
        ->assertJsonFragment(['uuid' => $formC->uuid]);
});

test('a user can sort forms by name', function () {
    $user = User::factory()->withTeam()->create();

    Form::factory()->create(['user_id' => $user->id,
        'team_id' => $user->current_team_id, 'name' => 'A Form']);
    Form::factory()->create(['user_id' => $user->id,
        'team_id' => $user->current_team_id, 'name' => 'Z Form']);
    Form::factory()->create(['user_id' => $user->id,
        'team_id' => $user->current_team_id, 'name' => 'H Form']);

    $response = $this->actingAs($user)
        ->get(route('api.forms.index', ['sort' => 'name']))
        ->assertStatus(200);

    expect($response->json('0.name'))->toBe('A Form');
    expect($response->json('1.name'))->toBe('H Form');
    expect($response->json('2.name'))->toBe('Z Form');

    $response = $this->actingAs($user)
        ->get(route('api.forms.index', ['sort' => 'name:desc']))
        ->assertStatus(200);

    expect($response->json('0.name'))->toBe('Z Form');
    expect($response->json('1.name'))->toBe('H Form');
    expect($response->json('2.name'))->toBe('A Form');
});

test('each form in the list has the time of its latest submission', function () {
    $user = User::factory()->withTeam()->create();
    $form = Form::factory()->create(['user_id' => $user->id, 'team_id' => $user->current_team_id]);
    $formWithoutSubmissions = Form::factory()->create(['user_id' => $user->id, 'team_id' => $user->current_team_id]);

    FormSession::factory()->for($form)->create(['is_completed' => '2026-10-01 08:00:00']);
    FormSession::factory()->for($form)->create(['is_completed' => '2026-10-03 09:30:00']);
    // started later, never submitted
    FormSession::factory()->for($form)->create();
    FormSession::factory()->for($formWithoutSubmissions)->create();

    $response = $this->actingAs($user)->getJson(route('api.forms.index'))->assertOk();

    expect(collect($response->json())->pluck('latest_submission_at', 'uuid')->all())->toEqual([
        $form->uuid => '2026-10-03T09:30:00.000000Z',
        $formWithoutSubmissions->uuid => null,
    ]);
});

test('the form list loads the latest submissions without a query per form', function () {
    $user = User::factory()->withTeam()->create();
    Form::factory()->count(30)->create(['user_id' => $user->id, 'team_id' => $user->current_team_id])
        ->each(fn (Form $form) => FormSession::factory()->for($form)->completed()->create());

    DB::enableQueryLog();
    $response = $this->actingAs($user)->getJson(route('api.forms.index'))->assertOk();

    expect($response->json('*.latest_submission_at'))->not->toContain(null);
    expect(collect(DB::getQueryLog())->filter(fn (array $query) => str_contains(strtolower($query['query']), 'max(')))
        ->toHaveCount(1);
});

test('a user can sort forms by latest submission, newest first and forms without submissions last', function () {
    $user = User::factory()->withTeam()->create();
    $older = Form::factory()->create(['user_id' => $user->id, 'team_id' => $user->current_team_id]);
    $none = Form::factory()->create(['user_id' => $user->id, 'team_id' => $user->current_team_id]);
    $newer = Form::factory()->create(['user_id' => $user->id, 'team_id' => $user->current_team_id]);

    FormSession::factory()->for($older)->create(['is_completed' => '2026-10-01 08:00:00']);
    FormSession::factory()->for($newer)->create(['is_completed' => '2026-10-02 08:00:00']);

    $this->actingAs($user)
        ->getJson(route('api.forms.index', ['sort' => 'latest_submission_at:desc']))
        ->assertOk()
        ->assertJsonPath('*.uuid', [$newer->uuid, $older->uuid, $none->uuid]);
});

test('an unknown filter or sort value returns the default list', function (array $query) {
    $user = User::factory()->withTeam()->create();
    $form = Form::factory()->create(['user_id' => $user->id, 'team_id' => $user->current_team_id]);
    Form::factory()->deleted()->create(['user_id' => $user->id, 'team_id' => $user->current_team_id]);

    $this->actingAs($user)
        ->getJson(route('api.forms.index', $query))
        ->assertOk()
        ->assertJsonPath('*.uuid', [$form->uuid]);
})->with([
    'unknown filter' => [['filter' => 'archived']],
    'filter as a list' => [['filter' => ['trashed']]],
    'unknown sort column' => [['sort' => 'password:desc']],
    'unknown sort direction' => [['sort' => 'name:sideways']],
    'sort as a list' => [['sort' => ['name']]],
]);

test('a user cannot return forms in other accounts', function () {
    /** @var User $user */
    $user = User::factory()->withTeam()->create();
    Form::factory()->create();

    $response = $this->actingAs($user)->get(route('api.forms.index'))
        ->assertStatus(200);

    $this->assertCount(0, $response->json());
});

test('authenticated user can view the edit page of his form', function () {
    $form = Form::factory()->create();

    // test response for unauthorized user
    $otherUser = User::factory()->withTeam()->create();
    $responseA = $this->actingAs($otherUser)
        ->get(route('forms.edit', $form->uuid));
    $responseA->assertStatus(404);

    // test response for team member
    $member = User::factory()->withTeam($form->team)->create();
    $this->actingAs($member)->get(route('forms.edit', $form->uuid))
        ->assertStatus(200);

    // test response for authorized user
    $this->actingAs($form->user)->get(route('forms.edit', $form->uuid))
        ->assertStatus(200)
        ->assertInertia(
            fn ($page) => $page
                ->component('Forms/Edit')
                ->has('form')
                ->where('form.uuid', fn ($value) => $value === $form->uuid)
        );
});

test('can retrieve the form data', function () {
    $form = Form::factory()->create();

    $response = $this->actingAs($form->user)
        ->get(route('api.forms.show', $form->uuid));

    $response->assertStatus(200);
    $this->assertEquals($form->uuid, $response->json('uuid'));
});

test('can update the form data with api call', function () {
    $form = Form::factory()->create();

    $updateRequest = [
        'name' => 'New Name',
        'description' => 'better description',
        'language' => 'de',

        // Theme Options
        'brand_color' => '#ffffff',
        'background_color' => '#000000',
        'text_color' => '#ffffff',
        'message_background_color' => '#ffffff',
        'message_text_color' => '#ffffff',
        'user_message_background_color' => '#ffffff',
        'user_message_text_color' => '#ffffff',
        'interaction_background_color' => '#ffffff',
        'interaction_text_color' => '#ffffff',
        'use_brighter_inputs' => true,
        'show_form_progress' => true,

        // Social Settings
        'twitter' => 'https://twitter.com/philreinking',
        'facebook' => 'https://facebook.com/philreinking',
        'instagram' => 'https://instagram.com/philreinking',
        'github' => 'https://github.com/philreinking',
        'linkedin' => 'https://linkedin.com/in/philreinking',
        'show_social_links' => true,

        // CTA / Completion Page Settings
        'cta_link' => 'https://philreinking.de',
        'cta_label' => 'Proceed',
        'use_cta_redirect' => true,
        'cta_redirect_delay' => 0,
        'show_cta_link' => true,
        'cta_append_params' => true,
        'cta_append_session_id' => true,

        // GDPR Related Information
        'has_data_privacy' => true,
        'privacy_link' => 'https://philreinking.de/privacy',
        'legal_notice_link' => 'https://philreinking.de/legal-notice',
        'data_retention_days' => 90,
        'is_auto_delete_enabled' => true,

        // End of Conversation
        'eoc_headline' => 'Thank You',
        'eoc_text' => 'You can close this window now',
    ];

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), $updateRequest)
        ->assertSuccessful()
        ->assertJsonFragment($updateRequest);

    // refresh form data
    $form = $form->fresh();

    $this->assertEquals('New Name', $form->name);
    $this->assertEquals('better description', $form->description);

    $this->assertEquals('#ffffff', $form->brand_color);
    $this->assertEquals('#000000', $form->background_color);
    $this->assertEquals('#ffffff', $form->text_color);
    $this->assertEquals('#ffffff', $form->message_background_color);
    $this->assertEquals('#ffffff', $form->message_text_color);
    $this->assertEquals('#ffffff', $form->user_message_background_color);
    $this->assertEquals('#ffffff', $form->user_message_text_color);
    $this->assertEquals('#ffffff', $form->interaction_background_color);
    $this->assertEquals('#ffffff', $form->interaction_text_color);
    $this->assertTrue($form->use_brighter_inputs);
    $this->assertTrue($form->show_form_progress);

    $this->assertTrue($form->show_social_links);
    $this->assertEquals('https://twitter.com/philreinking', $form->twitter);
    $this->assertEquals('https://facebook.com/philreinking', $form->facebook);
    $this->assertEquals('https://instagram.com/philreinking', $form->instagram);
    $this->assertEquals('https://github.com/philreinking', $form->github);
    $this->assertEquals('https://linkedin.com/in/philreinking', $form->linkedin);

    $this->assertEquals('https://philreinking.de', $form->cta_link);
    $this->assertEquals('Proceed', $form->cta_label);
    $this->assertTrue($form->show_cta_link);
    $this->assertTrue($form->use_cta_redirect);
    $this->assertEquals(0, $form->cta_redirect_delay);
    $this->assertTrue($form->cta_append_params);
    $this->assertTrue($form->cta_append_session_id);

    $this->assertEquals('https://philreinking.de/privacy', $form->privacy_link);
    $this->assertEquals('https://philreinking.de/legal-notice', $form->legal_notice_link);
    $this->assertEquals(90, $form->data_retention_days);
    $this->assertEquals(true, $form->is_auto_delete_enabled);
    $this->assertTrue($form->has_data_privacy);

    $this->assertEquals('Thank You', $form->eoc_headline);
    $this->assertEquals('You can close this window now', $form->eoc_text);
});

test('a changed form link must be http(s) or mailto', function (string $key) {
    $form = Form::factory()->create();

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [$key => 'javascript:void(0)'])
        ->assertStatus(422)
        ->assertJsonValidationErrors($key);

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [$key => 'mailto:team@example.com'])
        ->assertSuccessful();

    expect($form->fresh()->$key)->toBe('mailto:team@example.com');
})->with(['cta_link', 'privacy_link', 'legal_notice_link', 'twitter', 'facebook', 'instagram', 'github', 'linkedin']);

test('an unchanged old form link does not block saving', function () {
    $form = Form::factory()->create(['cta_link' => 'javascript:void(0)']);

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [
            'name' => 'New Name',
            'cta_link' => 'javascript:void(0)',
        ])
        ->assertSuccessful();

    expect($form->fresh()->name)->toBe('New Name');
});

test('a form name longer than 255 characters is refused with a clear message', function () {
    $form = Form::factory()->create();

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), ['name' => str_repeat('a', 256)])
        ->assertStatus(422)
        ->assertJsonPath('message', 'The name must not be greater than 255 characters.');

    expect($form->fresh()->name)->not->toBe(str_repeat('a', 256));
});

test('an empty form name is refused with a clear message', function () {
    $form = Form::factory()->create(['name' => 'Old Name']);

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), ['name' => ''])
        ->assertStatus(422)
        ->assertJsonPath('message', 'The name field must have a value.');

    expect($form->fresh()->name)->toBe('Old Name');
});

test('a new form name longer than 255 characters is refused', function () {
    $user = User::factory()->withTeam()->create();

    $this->actingAs($user)
        ->json('POST', route('api.forms.create'), ['name' => str_repeat('a', 256)])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');

    expect(Form::count())->toBe(0);
});

test('a changed form text must fit its column', function (string $key, int $max) {
    $form = Form::factory()->create();

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [$key => str_repeat('a', $max + 1)])
        ->assertStatus(422)
        ->assertJsonValidationErrors($key);

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [$key => str_repeat('a', $max)])
        ->assertSuccessful();

    expect($form->fresh()->$key)->toBe(str_repeat('a', $max));
})->with([
    ['name', 255],
    ['description', 1024],
    ['language', 4],
    ['brand_color', 255],
    ['background_color', 32],
    ['text_color', 32],
    ['message_background_color', 32],
    ['message_text_color', 32],
    ['user_message_background_color', 32],
    ['user_message_text_color', 32],
    ['interaction_background_color', 32],
    ['interaction_text_color', 32],
    ['cta_label', 255],
    ['eoc_headline', 255],
]);

test('a changed form link must fit its column', function (string $key) {
    $form = Form::factory()->create();

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [$key => 'https://'.str_repeat('a', 248)])
        ->assertStatus(422)
        ->assertJsonValidationErrors($key);

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [$key => 'https://'.str_repeat('a', 247)])
        ->assertSuccessful();
})->with(['cta_link', 'privacy_link', 'legal_notice_link', 'twitter', 'facebook', 'instagram', 'github', 'linkedin']);

test('can not update form of other users', function () {
    $form = Form::factory()->create();

    $updateRequest = [
        'name' => 'New Name',
        'description' => 'better description',
    ];

    /** @var User $newUser */
    $newUser = User::factory()->withTeam()->create();

    $this->actingAs($newUser)
        ->json('POST', route('api.forms.update', $form->uuid), $updateRequest)
        ->assertStatus(403);
});

test('can delete a form', function () {
    $form = Form::factory()->create();

    $this->actingAs($form->user)
        ->json('DELETE', route('api.forms.delete', $form->uuid))
        ->assertStatus(200);

    $this->assertNotNull($form->fresh()->deleted_at);
});

test('a user can permanently delete a form if it was soft deleted before', function () {
    $form = Form::factory()->create();

    $this->actingAs($form->user)
        ->json('DELETE', route('api.forms.trashed.delete', $form->uuid))
        ->assertStatus(422);

    $form->delete();

    $this->actingAs($form->user)
        ->json('DELETE', route('api.forms.trashed.delete', $form->uuid))
        ->assertStatus(200);

    $this->assertNull(Form::withTrashed()->find($form->id));
});

test('a user can restore a deleted form', function () {
    $form = Form::factory()->create();
    $form->delete();

    $this->assertNull(Form::find($form->id));

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.trashed.restore', $form->uuid))
        ->assertStatus(200);

    $this->assertNotNull(Form::find($form->id));
});

test('can enable or disable email notifications for a form', function () {
    $form = Form::factory()->create();

    $updateRequestA = [
        'is_notification_via_mail' => true,
    ];

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), $updateRequestA);

    // refresh form
    $form = $form->fresh();
    $this->assertTrue($form->is_notification_via_mail);

    $updateRequestB = [
        'is_notification_via_mail' => false,
    ];

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), $updateRequestB);

    // refresh form
    $form = $form->fresh();
    $this->assertNotTrue($form->is_notification_via_mail);
});

test('turning auto delete on needs a retention period of at least one day', function ($days) {
    $form = Form::factory()->create();

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [
            'is_auto_delete_enabled' => true,
            'data_retention_days' => $days,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('data_retention_days');

    $this->assertFalse($form->fresh()->is_auto_delete_enabled);
})->with([
    'empty' => [null],
    'zero' => [0],
    'negative' => [-1],
]);

test('a form with auto delete on cannot get a retention period below one day', function ($days) {
    $form = Form::factory()->create(['is_auto_delete_enabled' => true, 'data_retention_days' => 30]);

    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), ['data_retention_days' => $days])
        ->assertStatus(422)
        ->assertJsonValidationErrors('data_retention_days');

    $this->assertEquals(30, $form->fresh()->data_retention_days);
})->with([
    'empty' => [null],
    'zero' => [0],
    'negative' => [-5],
]);

test('with auto delete off, the retention period is not checked', function () {
    $form = Form::factory()->create();

    // the privacy settings always send the hidden retention field along
    $this->actingAs($form->user)
        ->json('POST', route('api.forms.update', $form->uuid), [
            'is_auto_delete_enabled' => false,
            'data_retention_days' => 0,
            'privacy_link' => 'https://example.com/privacy',
        ])
        ->assertSuccessful();

    $this->assertEquals('https://example.com/privacy', $form->fresh()->privacy_link);
});

test('a form whose name starts with an emoji or non-Latin text shows in the list and opens', function (string $name, string $initials) {
    $user = User::factory()->withTeam()->create();
    $form = Form::factory()->create([
        'name' => $name,
        'user_id' => $user->id,
        'team_id' => $user->current_team_id,
    ]);

    $this->actingAs($user)->getJson(route('api.forms.index'))
        ->assertOk()
        ->assertJsonPath('0.initials', $initials);

    $this->actingAs($user)->getJson(route('api.forms.show', $form->uuid))
        ->assertOk()
        ->assertJsonPath('initials', $initials);

    $this->actingAs($user)->get(route('forms.edit', $form->uuid))
        ->assertOk();
})->with([
    ['🎉 Party', '🎉'],
    ['调查问卷', '调查'],
    ['€ Preise', '€'],
    ['Müller Umfrage', 'Mü'],
]);
