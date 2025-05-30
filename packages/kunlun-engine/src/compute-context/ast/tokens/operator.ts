import { TokenType } from '../types';

function createBinop(keyword: string, binop: number): TokenType {
  return new TokenType(keyword, { binop });
}

export const pipeline = createBinop('|>', 0);
export const nullishCoalescing = createBinop('??', 1);
export const logicalOR = createBinop('||', 1);
export const logicalAND = createBinop('&&', 2);
export const bitwiseOR = createBinop('|', 3);
export const bitwiseXOR = createBinop('^', 4);
export const bitwiseAND = createBinop('&', 5);
export const equality = createBinop('==/!=/===/!==', 6);
export const relational = createBinop('</>/<=/>=', 7);
export const bitShift = createBinop('<</>>/>>>', 8);
export const plusMin = createBinop('+/-', 9);
export const modulo = createBinop('%', 10);
export const star = createBinop('*', 10);
export const slash = createBinop('/', 10);
export const exponent = createBinop('**', 11);

interface BinopItem {
  key: string;
  binop: number;
}

const KEYWORD_SPLIT = '/';

function generatorBinopArrays(): BinopItem[] {
  const arrays: BinopItem[] = [];
  [
    pipeline,
    nullishCoalescing,
    logicalOR,
    logicalAND,
    bitwiseOR,
    bitwiseXOR,
    bitwiseAND,
    equality,
    relational,
    bitShift,
    plusMin,
    modulo,
    star,
    slash,
    exponent
  ].forEach((v) => {
    if (v.keyword === KEYWORD_SPLIT) {
      arrays.push({
        key: KEYWORD_SPLIT,
        binop: slash.binop!
      });
    } else {
      v.keyword.split(KEYWORD_SPLIT).forEach((vv) => {
        arrays.push({
          key: vv,
          binop: v.binop!
        });
      });
    }
  });
  return arrays;
}

const binopArrays = generatorBinopArrays();

export function getBinopByKey(key: string): number | undefined {
  return binopArrays.find((v) => v.key === key)?.binop;
}
