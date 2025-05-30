export type ClearSessionFunction = () => void;

export class ClearCache {
  private static functionList: ClearSessionFunction[] = [];

  public static register(fn: ClearSessionFunction) {
    ClearCache.functionList.push(fn);
  }

  public static clear() {
    ClearCache.functionList.forEach((fn) => fn?.());
  }
}
