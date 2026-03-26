import { ExpressionLocale, type ExpressionLocaleType } from './language';

export class ExpressionLocaleManager {
  private static active: ExpressionLocaleType | undefined;

  private constructor() {
    // reject create object
  }

  public static default() {
    return ExpressionLocale.zhCN;
  }

  public static get() {
    if (ExpressionLocaleManager.active == null) {
      const lang = Reflect.get(window, '__lang');
      if (lang === 'zh-CN') {
        return ExpressionLocale.zhCN;
      }
      if (lang === 'en-US') {
        return ExpressionLocale.enUS;
      }
    }
    return ExpressionLocaleManager.default();
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
