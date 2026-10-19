export interface DatabaseInitializer<T> {
  get(): Promise<T>;
  reset(): void;
}

export function createDatabaseInitializer<T>(open: () => Promise<T>): DatabaseInitializer<T> {
  let instance: T | null = null;
  let initialization: Promise<T> | null = null;

  return {
    get(): Promise<T> {
      if (instance !== null) {
        return Promise.resolve(instance);
      }

      if (initialization === null) {
        initialization = Promise.resolve()
          .then(open)
          .then((opened) => {
            instance = opened;
            return opened;
          })
          .catch((error: unknown) => {
            initialization = null;
            instance = null;
            throw error;
          });
      }

      return initialization;
    },
    reset(): void {
      instance = null;
      initialization = null;
    },
  };
}
