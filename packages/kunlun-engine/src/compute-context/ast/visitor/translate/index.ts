import { RuntimeModel } from '../../../../runtime-metadata';
import { Language } from '../../language';
import { parser } from '../../parser';
import { Node } from '../../types';
import { StringAdapterContext } from '../to-string';
import { Visitor, VisitorAdapter } from '../visit';
import { TranslateAdapter } from './adapter';

/**
 * 翻译可选项参数
 * <ul>
 *   <li>当未指定时，仅提供表达式基础翻译；</li>
 *   <li>当指定 {@link TranslateOptions#model} 模型 时，使用默认适配器进行模型翻译；</li>
 *   <li>当指定 {@link TranslateOptions#language} 语言时，使用指定语言进行表达式解析；</li>
 *   <li>当指定 {@link TranslateOptions#visitor} 适配器时，使用指定适配器进行翻译；</li>
 * </ul>
 */
export type TranslateOptions = {
  model?: RuntimeModel;
  language?: Language;
  visitor?: VisitorAdapter;
};

export class Translate {
  public static run(expression: string | Node, options?: TranslateOptions): string | undefined {
    const node = parser(expression, { language: options?.language });
    if (node) {
      const nodeVisitor = new Visitor<StringAdapterContext>({
        visitor: options?.visitor || new TranslateAdapter({ model: options?.model })
      });
      nodeVisitor.visit(node);
      return nodeVisitor.getContext().result;
    }
    return undefined;
  }
}

export * from './language';
export * from './expression-locale';
export * from './adapter';
export * from './rsql-adapter';
