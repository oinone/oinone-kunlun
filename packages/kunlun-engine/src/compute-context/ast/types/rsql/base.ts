import type { AnyExpression } from '../base';

export type RSQLAnyExpression = AnyExpression & {
  marker?: number;
};
