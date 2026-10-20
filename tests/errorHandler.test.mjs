import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  describeError,
  installGlobalErrorHandlers,
} from '../utils/errorHandler.ts';

function createLogger() {
  const messages = [];
  return {
    messages,
    logger: {
      error: (message) => messages.push(message),
    },
  };
}

test('module evaluation does not throw when React Native has no ErrorUtils export', async () => {
  await assert.doesNotReject(import('../utils/errorHandler.ts'));
});

test('does not throw when ErrorUtils is unavailable', () => {
  const { messages, logger } = createLogger();
  const target = {};

  assert.doesNotThrow(() => {
    installGlobalErrorHandlers(undefined, target, logger);
  });

  assert.equal(messages.length, 0);
  assert.equal(typeof target.onunhandledrejection, 'function');
});

test('installs a handler when ErrorUtils is available', () => {
  const { messages, logger } = createLogger();
  let installedHandler;

  installGlobalErrorHandlers(
    {
      getGlobalHandler: () => undefined,
      setGlobalHandler: (handler) => {
        installedHandler = handler;
      },
    },
    {},
    logger
  );

  const error = new Error('startup failed');
  assert.doesNotThrow(() => installedHandler(error, true));

  assert.equal(messages.length, 1);
  assert.match(messages[0], /isFatal=true/);
  assert.match(messages[0], /startup failed/);
});

test('chains to the original React Native global handler', () => {
  const { logger } = createLogger();
  const calls = [];
  let installedHandler;
  const originalHandler = (error, isFatal) => calls.push({ error, isFatal });

  installGlobalErrorHandlers(
    {
      getGlobalHandler: () => originalHandler,
      setGlobalHandler: (handler) => {
        installedHandler = handler;
      },
    },
    {},
    logger
  );

  const error = new Error('boom');
  installedHandler(error, false);

  assert.deepEqual(calls, [{ error, isFatal: false }]);
});

test('reports global errors and unhandled rejections to the crash tracker', () => {
  const reported = [];
  let installedHandler;

  installGlobalErrorHandlers(
    {
      getGlobalHandler: () => undefined,
      setGlobalHandler: (handler) => {
        installedHandler = handler;
      },
    },
    {},
    { error: () => {} },
    (error, context) => reported.push({ message: error.message, context })
  );

  installedHandler(new Error('render boom'), true);
  assert.deepEqual(reported[0], {
    message: 'render boom',
    context: { source: 'global-error', isFatal: true },
  });

  const target = {};
  installGlobalErrorHandlers(
    undefined,
    target,
    { error: () => {} },
    (error, context) => reported.push({ message: error.message, context })
  );
  target.onunhandledrejection({ reason: new Error('promise boom') });

  assert.deepEqual(reported[1], {
    message: 'promise boom',
    context: { source: 'unhandled-rejection', isFatal: false },
  });
});

test('does not overwrite an existing unhandled rejection handler', () => {
  const { logger } = createLogger();
  const existingHandler = () => {};
  const target = { onunhandledrejection: existingHandler };

  installGlobalErrorHandlers(undefined, target, logger);

  assert.equal(target.onunhandledrejection, existingHandler);
});

test('unhandled rejection logging never throws on unprintable values', () => {
  const { messages, logger } = createLogger();
  const target = {};
  const unprintable = {
    toString() {
      throw new Error('cannot stringify');
    },
  };

  installGlobalErrorHandlers(undefined, target, logger);

  assert.doesNotThrow(() => target.onunhandledrejection({ reason: unprintable }));
  assert.match(messages[0], /Unprintable error/);
});

test('describeError falls back for values without a usable string representation', () => {
  assert.match(describeError(new Error('plain error')), /plain error/);
  assert.equal(describeError(42), '42');
  assert.equal(
    describeError({
      toString() {
        throw new Error('cannot stringify');
      },
    }),
    'Unprintable error'
  );
});
