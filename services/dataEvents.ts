type DataChangeListener = () => void;

const listeners = new Set<DataChangeListener>();

export function notifyDataChanged(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('[DATA] listener failed', error);
    }
  });
}

export function subscribeToDataChanges(listener: DataChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
