import type { Literal } from '../base';
import type { RSQLAnyExpression } from './base';

/**
 * '{@link RSQLStringLiteral#value}'
 */
export type RSQLStringLiteral = Literal & {
  type: 'RSQLStringLiteral';
  expressions: RSQLAnyExpression[];
  quote?: boolean;
};
