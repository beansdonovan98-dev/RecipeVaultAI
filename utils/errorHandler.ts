import { ErrorUtils } from 'react-native';

console.log('[STARTUP] installing global error handlers');

function describe(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  try {
    return String(error);
  } catch {
    return 'Unprintable error';
  }
}

const originalHandler = ErrorUtils.getGlobalHandler();

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error(`[GLOBAL ERROR] isFatal=${isFatal}\nStack trace:\n${describe(error)}`);
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});

if (typeof global !== 'undefined' && typeof (global as any).onunhandledrejection === 'undefined') {
  (global as any).onunhandledrejection = (event: any) => {
    console.error(`[UNHANDLED PROMISE REJECTION]\nStack trace:\n${describe(event?.reason)}`);
  };
}

const originalConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  try {
    const message = args.map(describe).join(' ');
    originalConsoleError(`[CONSOLE.ERROR] ${message}`);
  } catch {
    originalConsoleError('[CONSOLE.ERROR] Failed to format console error');
  }
};

export {};
