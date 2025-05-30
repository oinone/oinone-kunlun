const defaultTokenProperties: string[] = ['activeRecords', 'rootRecord', 'openerRecord', 'scene', 'activeRecord'];

let activeTokenProperties: string[] | undefined;

export class TokenPropertiesManager {
  private constructor() {
    // reject create object
  }

  public static default() {
    return defaultTokenProperties;
  }

  public static get() {
    return activeTokenProperties || TokenPropertiesManager.default();
  }

  public static using(tokenProperties: string[], fn: () => void) {
    const lastedActiveTokenProperties = activeTokenProperties;
    activeTokenProperties = tokenProperties;
    try {
      fn();
    } finally {
      activeTokenProperties = lastedActiveTokenProperties;
    }
  }
}
