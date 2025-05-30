export class CastHelper {
  public static cast<T>(val: unknown): T {
    return val as T;
  }
}
