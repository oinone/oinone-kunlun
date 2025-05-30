import { ExpressionLanguageInstance, Language } from '../language';

export interface Options extends Record<string, unknown> {
  language: Language;
  block: boolean;
}

export const defaultOptions: Options = {
  language: ExpressionLanguageInstance,
  block: true
};

export function getOptions(options?: Partial<Options>): Options {
  const finalOptions = (options || {}) as Options;
  Object.entries(defaultOptions).forEach(([key, value]) => {
    if (finalOptions[key] == null) {
      finalOptions[key] = value;
    }
  });
  return finalOptions;
}
