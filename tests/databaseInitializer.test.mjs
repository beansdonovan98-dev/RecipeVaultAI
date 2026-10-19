import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDatabaseInitializer } from '../db/databaseInitializer.ts';

test('concurrent getDatabase calls share one initialization promise', async () => {
  let openCalls = 0;
  const database = { name: 'recipevault.db' };
  const initializer = createDatabaseInitializer(async () => {
    openCalls += 1;
    await Promise.resolve();
    return database;
  });

  const results = await Promise.all([
    initializer.get(),
    initializer.get(),
    initializer.get(),
  ]);

  assert.equal(openCalls, 1);
  assert.ok(results.every((result) => result === database));
});

test('queries wait for database open and schema initialization to complete', async () => {
  let resolveInitialization;
  const initialization = new Promise((resolve) => {
    resolveInitialization = resolve;
  });
  const database = { query: () => 'rows' };
  let schemaReady = false;
  const initializer = createDatabaseInitializer(async () => {
    await initialization;
    schemaReady = true;
    return database;
  });

  let settled = false;
  const query = initializer
    .get()
    .then((opened) => {
      assert.equal(schemaReady, true);
      return opened.query();
    })
    .then((rows) => {
      settled = true;
      return rows;
    });

  await Promise.resolve();
  assert.equal(settled, false);

  resolveInitialization();
  assert.equal(await query, 'rows');
});

test('initialization failure preserves the original error and stack', async () => {
  const originalError = new Error('unable to open database file');
  const initializer = createDatabaseInitializer(async () => {
    throw originalError;
  });

  await assert.rejects(initializer.get(), (error) => {
    assert.equal(error, originalError);
    assert.match(error.stack, /unable to open database file/);
    return true;
  });
});

test('retry after failure opens the database again', async () => {
  let openCalls = 0;
  const database = { name: 'recipevault.db' };
  const initializer = createDatabaseInitializer(async () => {
    openCalls += 1;
    if (openCalls === 1) {
      throw new Error('first attempt failed');
    }
    return database;
  });

  await assert.rejects(initializer.get(), /first attempt failed/);
  assert.equal(await initializer.get(), database);
  assert.equal(openCalls, 2);
});

test('reset allows a fresh initialization', async () => {
  let openCalls = 0;
  const initializer = createDatabaseInitializer(async () => {
    openCalls += 1;
    return { attempt: openCalls };
  });

  assert.deepEqual(await initializer.get(), { attempt: 1 });
  assert.deepEqual(await initializer.get(), { attempt: 1 });

  initializer.reset();

  assert.deepEqual(await initializer.get(), { attempt: 2 });
  assert.equal(openCalls, 2);
});

test('synchronous open errors are surfaced as rejections', async () => {
  const originalError = new Error('native module unavailable');
  const initializer = createDatabaseInitializer(() => {
    throw originalError;
  });

  await assert.rejects(initializer.get(), (error) => {
    assert.equal(error, originalError);
    return true;
  });
});
