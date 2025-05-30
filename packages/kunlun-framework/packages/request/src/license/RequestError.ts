export class RequestError extends Error {
  public constructor(message?: string) {
    super(message || 'Invalid request.');
  }
}
