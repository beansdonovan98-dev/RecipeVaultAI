import { ErrorUtils } from 'react-native';

const originalHandler = ErrorUtils.getGlobalHandler();

ErrorUtils.setGlobalHandler((error, isFatal) => {
  const stack = error?.stack ?? error?.message ?? String(error);
  console.error(
    `[GLOBAL ERROR] isFatal=${isFatal}\nStack trace:\n${stack}`
  );
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});

if (typeof global !== 'undefined' && typeof (global as any).onunhandledrejection === 'undefined') {
  (global as any).onunhandledrejection = (event: any) => {
    const reason = event?.reason;
    const stack = reason?.stack ?? reason?.message ?? String(reason);
    console.error(
      `[UNHANDLED PROMISE REJECTION]\nStack trace:\n${stack}`
    );
  };
}

const originalConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  const message = args.map(a => (a instanceof Error ? (a.stack ?? a.message) : String(a))).join(' ');
  originalConsoleError(`[CONSOLE.ERROR] ${message}`);
};

export {};
