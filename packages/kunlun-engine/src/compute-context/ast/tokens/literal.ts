import { TokenType } from '../types';

const before = true;
const start = true;

export const int = new TokenType('int', { start });
export const bigint = new TokenType('bigint', { start });
export const number = new TokenType('number', { start });
export const bignumber = new TokenType('bignumber', { start });

export const string = new TokenType('string', { start });
export const template = new TokenType('template', { start });
export const regexp = new TokenType('regexp', { start });
