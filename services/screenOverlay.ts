export type OverlayScreen =
  | 'add'
  | 'ai-generate'
  | 'ai-substitute'
  | 'settings'
  | 'sync-status'
  | 'customize';

type OverlayListener = (screen: OverlayScreen | null) => void;

let currentScreen: OverlayScreen | null = null;
let listener: OverlayListener | null = null;

export function openScreenOverlay(screen: OverlayScreen): void {
  currentScreen = screen;
  listener?.(screen);
}

export function closeScreenOverlay(): void {
  currentScreen = null;
  listener?.(null);
}

export function getScreenOverlay(): OverlayScreen | null {
  return currentScreen;
}

export function subscribeToScreenOverlay(next: OverlayListener): () => void {
  listener = next;
  next(currentScreen);
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}
