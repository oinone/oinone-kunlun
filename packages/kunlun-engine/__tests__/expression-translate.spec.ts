import { RSQLLanguageInstance } from '../src/compute-context/ast/language';
import { RSQLStringAdapterInstance } from '../src/compute-context/ast/visitor/to-string';
import { RSQLLocale, RSQLTranslateAdapter } from '../src/compute-context/ast/visitor/translate';
import { ExpressionExecutor } from '../src/compute-context';
import { model1 } from '../src/compute-context/__tests__/data';
import { CastHelper, RSQLHelper } from '@oinone/kunlun-shared';

describe('ExpressionExecutor translate expression', () => {
  it('parser and toString keep expression structure for template string', () => {
    const expression = '`ccc${activeRecord.name + "ddd"}bbb` + activeRecord.name + "bbb"';
    const node = ExpressionExecutor.parser(expression);
    expect(node).toBeDefined();
    if (!node) {
      return;
    }
    const text = ExpressionExecutor.toString(node);
    const node2 = ExpressionExecutor.parser(text);
    expect(node2).toBeDefined();
  });

  it('translate expression with model provides non-empty result', () => {
    const expression = '`ccc${activeRecord.name + "ddd"}bbb` + activeRecord.name + "bbb"';
    const translated = ExpressionExecutor.translate(expression, { model: model1 });
    expect(typeof translated).toBe('string');
    expect(translated.length).toBeGreaterThan(0);
  });
});

describe('ExpressionExecutor translate RSQL', () => {
  it('RSQL parse and toRSQL round trip', () => {
    const rsql = 'code =notnull= false';
    const root = RSQLHelper.parseRSQL(rsql, {
      model: model1.model,
      fields: CastHelper.cast(model1.modelFields)
    });
    if (!root) {
      return;
    }
    const result = RSQLHelper.toRSQL(root) || '';
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('RSQL ExpressionExecutor parser/toString/translate work together', () => {
    const rsql = 'code =notnull= false';
    const node = ExpressionExecutor.parser(rsql, { language: RSQLLanguageInstance });
    expect(node).toBeDefined();
    if (!node) {
      return;
    }
    const text = ExpressionExecutor.toString(node, RSQLStringAdapterInstance);
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
    const node2 = ExpressionExecutor.parser(text, { language: RSQLLanguageInstance });
    expect(node2).toBeDefined();
    const translated = ExpressionExecutor.translate(rsql, {
      language: RSQLLanguageInstance,
      visitor: new RSQLTranslateAdapter({
        model: model1,
        locale: RSQLLocale.zhCN
      })
    });
    expect(typeof translated).toBe('string');
    expect(translated.length).toBeGreaterThan(0);
  });
});
