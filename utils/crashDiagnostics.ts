import type { CrashDiagnosis } from '@/types/crash';

const MAX_FINGERPRINT_INPUT = 4000;

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.name || 'Unknown error';
  }
  try {
    const value = String(error);
    return value || 'Unknown error';
  } catch {
    return 'Unprintable error';
  }
}

export function getErrorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name || 'Error';
  }
  return typeof error;
}

export function getErrorStack(error: unknown, fallbackMessage?: string): string {
  if (error instanceof Error) {
    return error.stack ?? `${error.name}: ${error.message}`;
  }
  try {
    return `${typeof error}: ${String(error)}`;
  } catch {
    return fallbackMessage ?? 'Unprintable error';
  }
}

export function getTopStackFrame(stack: string | null | undefined): string {
  if (!stack) {
    return 'no-stack';
  }
  const lines = stack.split('\n');
  const frame = lines.find((line) => /^\s+at\s/.test(line)) ?? lines.find((line) => line.trim().length > 0);
  if (!frame) {
    return 'no-stack';
  }
  return frame
    .replace(/^\s+at\s+/, '')
    .replace(/\(.*?:\d+:\d+\)$/, '')
    .replace(/:\d+:\d+$/, '')
    .replace(/\?[^)]*$/, '')
    .trim()
    .slice(0, 300) || 'no-stack';
}

function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function createFingerprint(params: {
  source: string;
  name: string;
  message: string;
  stack?: string | null;
  componentStack?: string | null;
}): string {
  const topFrame = getTopStackFrame(params.stack);
  const firstComponent = (params.componentStack ?? '')
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0) ?? '';
  const normalizedMessage = params.message.toLowerCase().replace(/\d+/g, '#').trim();
  const input = [
    params.source,
    params.name,
    normalizedMessage,
    topFrame,
    firstComponent,
  ].join('|').slice(0, MAX_FINGERPRINT_INPUT);

  return `${params.source}:${hashString(input)}`;
}

interface DiagnosisRule {
  test: RegExp;
  likelyCause: string;
  suggestedFix: string;
}

const DIAGNOSIS_RULES: DiagnosisRule[] = [
  {
    test: /no such table|no such column/i,
    likelyCause:
      'The SQLite schema is missing a table or column expected by the query. This usually happens after a schema change or a failed/partial database initialization.',
    suggestedFix:
      'Verify the table/column names in the query and add a migration (ALTER TABLE/CREATE TABLE IF NOT EXISTS). If this is a fresh install, clear the app data and relaunch once.',
  },
  {
    test: /database is locked|SQLITE_BUSY/i,
    likelyCause:
      'Two database operations tried to write at the same time, or a transaction was left open.',
    suggestedFix:
      'Serialize writes through a single queue, avoid long-running transactions, and make sure every transaction is committed or rolled back in a finally block.',
  },
  {
    test: /disk image is malformed|file is not a database|database disk image/i,
    likelyCause: 'The SQLite file on disk is corrupted or is not a valid database.',
    suggestedFix:
      'Back up any recoverable data, delete the database file, and let the app recreate it. Add a backup before migrations to prevent recurrence.',
  },
  {
    test: /unable to open database|SQLITE_CANTOPEN|failed to open/i,
    likelyCause: 'The app could not open or create the database file, often due to storage or permission problems.',
    suggestedFix:
      'Check that the device has free storage and that the app can write to its documents directory. Retry after restarting the app.',
  },
  {
    test: /network request failed|failed to fetch|timeout|timed out|ECONNREFUSED|ENOTFOUND/i,
    likelyCause: 'A network request failed or timed out. The device may be offline or the server may be unreachable.',
    suggestedFix:
      'Add an offline/retry path, show a retry button, and confirm the API host and timeout settings. Reproduce with airplane mode enabled.',
  },
  {
    test: /undefined is not an object|null is not an object|cannot read propert(y|ies)|cannot read prop/i,
    likelyCause:
      'Code accessed a property on null or undefined data. This is commonly caused by a missing route param, an empty API response, or a record that no longer exists.',
    suggestedFix:
      'Find the top app frame in the stack, guard the value before reading it, and provide an empty/fallback state. Validate route params and database results.',
  },
  {
    test: /is not a function/i,
    likelyCause:
      'A value was used as a function but was undefined or the wrong type, or a native module API does not exist in this build.',
    suggestedFix:
      'Check the import and the value at the top stack frame. Confirm the installed package version supports the API and rebuild the native app after adding native modules.',
  },
  {
    test: /invalid hook call|rendered more hooks|rendered fewer hooks/i,
    likelyCause:
      'React hooks were called conditionally or from outside a component, or two copies of React are loaded.',
    suggestedFix:
      'Call hooks unconditionally at the top of the component and remove duplicate react/react-native packages (check package-lock and Metro resolution).',
  },
  {
    test: /maximum update depth exceeded/i,
    likelyCause: 'A component is stuck in a setState/render loop, usually an effect that updates its own dependency.',
    suggestedFix:
      'Find the effect that updates state it also depends on. Stabilize callbacks with useCallback/useMemo and add a guard before setting state.',
  },
  {
    test: /invariant violation/i,
    likelyCause:
      'A React or React Navigation invariant failed. This usually means an invalid screen, navigation state, or view hierarchy.',
    suggestedFix:
      'Read the invariant text and the component stack, then confirm the screen exists in the navigator and that render output is valid React Native markup.',
  },
  {
    test: /unable to resolve module|requiring unknown module|cannot find module/i,
    likelyCause: 'Metro could not resolve a JavaScript module or asset at bundle/runtime.',
    suggestedFix:
      'Install the missing dependency, verify the import path and asset exists, then restart Metro with a cleared cache (npx expo start -c).',
  },
  {
    test: /JSON|unexpected token|Unexpected end of input/i,
    likelyCause: 'Stored JSON could not be parsed, so a recipe or settings record is malformed.',
    suggestedFix:
      'Validate JSON before saving and keep the safe parse fallback. Inspect or repair the affected row, and add a schema version to stored payloads.',
  },
  {
    test: /out of memory|allocation failed|RangeError/i,
    likelyCause: 'The app ran out of memory or exceeded a value limit, often while loading large images or lists.',
    suggestedFix:
      'Downscale images before storing them, paginate large lists, and release unused resources. Reproduce while watching memory in Xcode/Android Studio.',
  },
  {
    test: /permission|denied|not authorized/i,
    likelyCause: 'A system permission was denied or is missing from the app manifest.',
    suggestedFix:
      'Add the permission to app.json/native manifest, request it at the right moment, and show a clear fallback when the user denies it.',
  },
  {
    test: /native module|TurboModule|module .* could not be found/i,
    likelyCause:
      'A native module is missing from the installed build, usually after adding a package without rebuilding.',
    suggestedFix:
      'Rebuild the development/production app (npx expo run:android, npx expo run:ios) after installing native dependencies. Clean the native build if it persists.',
  },
];

export function diagnoseCrash(message: string, stack?: string | null): CrashDiagnosis {
  const haystack = `${message}\n${stack ?? ''}`;

  for (const rule of DIAGNOSIS_RULES) {
    if (rule.test.test(haystack)) {
      return { likelyCause: rule.likelyCause, suggestedFix: rule.suggestedFix };
    }
  }

  return {
    likelyCause:
      'The app did not recognize this error pattern. The stack trace and route below are the most useful clues.',
    suggestedFix:
      'Open the top app frame in the stack, reproduce the action that triggered it, and inspect the value/state used on that line. Use a try/catch with captureException for follow-up details.',
  };
}

export function formatCrashTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
