/**
 * Determine if the argument is shaped like a Promise
 */
export function isPromise<T = unknown>(obj: unknown): obj is Promise<T> {
  // allow any Promise/A+ compliant thenable.
  // It's up to the caller to ensure that obj.then conforms to the spec
  return !!obj && typeof (obj as { then: unknown }).then === 'function';
}
