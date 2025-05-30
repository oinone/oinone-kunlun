import { ExpressionLocale, ExpressionLocaleType } from './language';

export class ExpressionLocaleManager {
  private static active: ExpressionLocaleType | undefined;

  private constructor() {
    // reject create object
  }

  public static default() {
    return ExpressionLocale.zhCN;
  }

  public static get() {
    return ExpressionLocaleManager.active || ExpressionLocaleManager.default();
  }

  public static using(locale: ExpressionLocaleType, fn: () => void) {
    const lastedActiveExpressionLocale = ExpressionLocaleManager.active;
    ExpressionLocaleManager.active = locale;
    try {
      fn();
    } finally {
      ExpressionLocaleManager.active = lastedActiveExpressionLocale;
    }
  }
}
