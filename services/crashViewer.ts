type CrashViewerListener = () => void;

let listener: CrashViewerListener | null = null;

export function requestCrashViewer(): void {
  try {
    listener?.();
  } catch {
    // Opening the viewer must never throw.
  }
}

export function subscribeToCrashViewer(next: CrashViewerListener): () => void {
  listener = next;
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}
