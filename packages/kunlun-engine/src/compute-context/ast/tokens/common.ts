import { TokenType } from '../types';

const before = true;
const start = true;

export const bracketL = new TokenType('[', { before, start });
export const bracketHashL = new TokenType('#[', { before, start });
export const bracketBarL = new TokenType('[|', { before, start });
export const bracketR = new TokenType(']');
export const bracketBarR = new TokenType('|]');
export const braceL = new TokenType('{', { before, start });
export const braceBarL = new TokenType('{|', { before, start });
export const braceHashL = new TokenType('#{', { before, start });
export const braceR = new TokenType('}');
export const braceBarR = new TokenType('|}');
export const parenL = new TokenType('(', { before, start });
export const parenR = new TokenType(')');
export const comma = new TokenType(',', { before });
export const semi = new TokenType(';', { before });
export const colon = new TokenType(':', { before });
export const doubleColon = new TokenType('::', { before });
export const dot = new TokenType('.');
export const question = new TokenType('?', { before });
export const questionDot = new TokenType('?.');
export const ellipsis = new TokenType('...', { before });
export const backQuote = new TokenType('`', { start });
export const dollarBraceL = new TokenType('${', { before, start });

export const space = new TokenType(' ');
