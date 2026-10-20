import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { captureException } from '@/services/crashTracker';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onViewCrashReports?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const stack = error?.stack ?? error?.message ?? String(error);
    console.error(
      `[ERROR BOUNDARY] Caught render error\nStack trace:\n${stack}\nComponent stack:\n${errorInfo?.componentStack ?? 'N/A'}`
    );
    captureException(error, {
      source: 'react-error-boundary',
      isFatal: true,
      componentStack: errorInfo?.componentStack ?? null,
    });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  openCrashReports = () => {
    if (this.props.onViewCrashReports) {
      this.props.onViewCrashReports();
      return;
    }
    try {
      router.push('/crashes');
    } catch {
      // Navigation is best-effort in the fallback UI.
    }
  };

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.reset} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={this.openCrashReports}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>View crash reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    ...Typography.subtitle,
    marginBottom: Spacing.sm,
    color: Colors.error,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  buttonText: {
    ...Typography.label,
    color: Colors.white,
  },
  secondaryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  secondaryButtonText: {
    ...Typography.label,
    color: Colors.primary,
  },
});
