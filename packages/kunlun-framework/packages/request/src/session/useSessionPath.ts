import { ReturnPromise } from '@oinone/kunlun-shared';

let activeSessionPath: string | undefined;

export async function useSessionPath<T>(sessionPath: string | undefined, fn: () => ReturnPromise<T>): Promise<T> {
  const lastSessionPath = activeSessionPath;
  activeSessionPath = sessionPath;
  try {
    return await fn();
  } finally {
    activeSessionPath = lastSessionPath;
  }
}

export function setSessionPath(sessionPath: string | undefined): void {
  activeSessionPath = sessionPath;
}

export function getSessionPath(): string | undefined {
  return activeSessionPath;
}
