import { router, type Href } from 'expo-router';
import { Alert } from 'react-native';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';

export function navigateSafely(href: Href, breadcrumb: string): void {
  recordBreadcrumb(breadcrumb, { href });

  try {
    router.push(href);
  } catch (error) {
    recordBreadcrumb(`navigation-failed:${String(href)}`);
    captureException(error, {
      source: 'navigation',
      isFatal: false,
      extra: { href },
    });

    Alert.alert(
      'Unable to open screen',
      `${error instanceof Error ? error.message : String(error)}\n\nThe error was saved to Crash Reports.`
    );
  }
}
