export class UnsupportedOperationException extends Error {
  public constructor(message?: string) {
    super(message || 'Unsupported operation exception.');
  }
}
