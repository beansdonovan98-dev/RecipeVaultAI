import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRemoteId,
  generateRoomCode,
  getImageFileMeta,
  isRemoteImageUri,
  isRoomCodeValid,
  normalizeRoomCode,
  toRemoteRecipeInput,
} from '../services/syncHelpers.ts';

test('room codes are normalized and validated', () => {
  assert.equal(normalizeRoomCode('  ab-c 12! '), 'ABC12');
  assert.equal(normalizeRoomCode('family7x2k'), 'FAMILY7X2K');
  assert.equal(isRoomCodeValid('abc12'), false);
  assert.equal(isRoomCodeValid('abc-123'), true);
  assert.equal(isRoomCodeValid('A'.repeat(20)), true);
  assert.equal(isRoomCodeValid('A'.repeat(21)), false);
});

test('room code generation uses the unambiguous alphabet', () => {
  assert.equal(generateRoomCode(10, () => 0), 'AAAAAAAAAA');
  assert.equal(generateRoomCode(4, () => 0.999999), '9999');
  const code = generateRoomCode(12);
  assert.equal(code.length, 12);
  assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
});

test('remote ids are deterministic UUID v4 strings', () => {
  assert.equal(createRemoteId(() => 0), '00000000-0000-4000-8000-000000000000');
  assert.match(createRemoteId(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('image helpers identify remote uris and upload metadata', () => {
  assert.equal(isRemoteImageUri('https://example.com/photo.jpg'), true);
  assert.equal(isRemoteImageUri('file:///tmp/photo.jpg'), false);
  assert.equal(isRemoteImageUri(null), false);

  assert.deepEqual(getImageFileMeta('file:///tmp/photo.PNG?width=100'), {
    extension: 'png',
    mimeType: 'image/png',
  });
  assert.deepEqual(getImageFileMeta('ph://ABCDEF'), {
    extension: 'jpg',
    mimeType: 'image/jpeg',
  });
  assert.deepEqual(getImageFileMeta('file:///tmp/photo.heic'), {
    extension: 'heic',
    mimeType: 'image/heic',
  });
});

test('sync records become remote payloads with safe fallbacks', () => {
  const payload = toRemoteRecipeInput(
    {
      id: 1,
      remoteId: 'remote-1',
      title: '  Soup  ',
      description: 'Warm',
      category: 'Dinner',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      ingredients: '[{"name":"Carrot"}]',
      instructions: 'not-json',
      imageUri: 'https://example.com/soup.jpg',
      isFavorite: true,
      author: 'princess',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
      dirty: true,
      deleted: false,
      revision: 1,
    },
    'remote-1',
    'https://example.com/soup.jpg'
  );

  assert.equal(payload.title, 'Soup');
  assert.deepEqual(payload.ingredients, [{ name: 'Carrot' }]);
  assert.deepEqual(payload.instructions, []);
  assert.equal(payload.imageUrl, 'https://example.com/soup.jpg');
  assert.equal(payload.isFavorite, true);
  assert.equal(payload.author, 'princess');
});
