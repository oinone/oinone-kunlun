import { Literal } from '../base';
import { RSQLAnyExpression } from './base';

/**
 * '{@link RSQLStringLiteral#value}'
 */
export type RSQLStringLiteral = Literal & {
  type: 'RSQLStringLiteral';
  expressions: RSQLAnyExpression[];
  quote?: boolean;
};
