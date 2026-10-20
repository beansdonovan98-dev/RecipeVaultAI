import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAuthorLabel, getPartnerAuthor, isAuthorId } from '../constants/authors.ts';

test('author ids are recognized and formatted', () => {
  assert.equal(isAuthorId('daddy'), true);
  assert.equal(isAuthorId('princess'), true);
  assert.equal(isAuthorId('someone'), false);
  assert.equal(isAuthorId(null), false);
  assert.equal(getAuthorLabel('daddy'), 'Daddy 🍆');
  assert.equal(getAuthorLabel('princess'), 'Princess 🍑');
  assert.equal(getAuthorLabel(''), null);
  assert.equal(getAuthorLabel(undefined), null);
  assert.equal(getPartnerAuthor('daddy'), 'princess');
  assert.equal(getPartnerAuthor('princess'), 'daddy');
});
