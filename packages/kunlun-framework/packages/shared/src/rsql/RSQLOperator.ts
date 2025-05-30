import { JObject } from '../ObjectUtils';

/**
 * RSQL运算符
 */
export class RSQLComparisonOperator extends JObject {
  private readonly _symbols: string[];

  private readonly _multi: boolean;

  public constructor(symbols: string[], multi = false) {
    super();
    this._symbols = [...symbols];
    this._multi = multi;
  }

  public get symbols() {
    return [...this._symbols];
  }

  public get symbol() {
    return this._symbols[0];
  }

  public get isMulti() {
    return this._multi;
  }

  public isSymbolEquals(symbol: string) {
    return this._symbols.some((v) => v === symbol);
  }
}

/**
 * RSQL逻辑运算符
 */
export enum RSQLLogicalOperator {
  AND = 'and',
  OR = 'or'
}

/**
 * RSQL逻辑运算符
 */
export class RSQLLogicalOperators {
  private static AND = [RSQLLogicalOperator.AND, ';'];

  private static OR = [RSQLLogicalOperator.OR, ','];

  public static isAnd(operator: string): boolean {
    return RSQLLogicalOperators.AND.includes(operator.toLowerCase());
  }

  public static isOr(operator: string): boolean {
    return RSQLLogicalOperators.OR.includes(operator.toLowerCase());
  }
}

/**
 * RSQL操作符
 */
export class RSQLOperators {
  public static EQUAL = new RSQLComparisonOperator(['==']);

  public static NOT_EQUAL = new RSQLComparisonOperator(['!=']);

  public static GREATER_THAN = new RSQLComparisonOperator(['=gt=', '>']);

  public static GREATER_THAN_OR_EQUAL = new RSQLComparisonOperator(['=ge=', '>=']);

  public static LESS_THAN = new RSQLComparisonOperator(['=lt=', '<']);

  public static LESS_THAN_OR_EQUAL = new RSQLComparisonOperator(['=le=', '<=']);

  public static IN = new RSQLComparisonOperator(['=in='], true);

  public static NOT_IN = new RSQLComparisonOperator(['=out='], true);

  public static IS_NULL = new RSQLComparisonOperator(['=isnull=']);

  public static IS_NOT_NULL = new RSQLComparisonOperator(['=notnull=']);

  public static COLUMN_EQUAL = new RSQLComparisonOperator(['=cole=']);

  public static COLUMN_NOT_EQUAL = new RSQLComparisonOperator(['=colnot=']);

  public static LIKE = new RSQLComparisonOperator(['=like=']);

  public static LIKE_RIGHT = new RSQLComparisonOperator(['=starts=']);

  public static LIKE_LEFT = new RSQLComparisonOperator(['=ends=']);

  public static NOT_LIKE = new RSQLComparisonOperator(['=notlike=']);

  public static NOT_LIKE_RIGHT = new RSQLComparisonOperator(['=notstarts=']);

  public static NOT_LIKE_LEFT = new RSQLComparisonOperator(['=notends=']);

  public static BIT = new RSQLComparisonOperator(['=bit='], true);

  public static NOT_BIT = new RSQLComparisonOperator(['=notbit='], true);

  public static HAS = new RSQLComparisonOperator(['=has='], true);

  public static NOT_HAS = new RSQLComparisonOperator(['=hasnt='], true);

  public static HAS_OR = new RSQLComparisonOperator(['=hasor='], true);

  public static HAS_NOT_OR = new RSQLComparisonOperator(['=hasntor='], true);

  public static operators(): Set<RSQLComparisonOperator> {
    return new Set<RSQLComparisonOperator>([
      RSQLOperators.EQUAL,
      RSQLOperators.NOT_EQUAL,
      RSQLOperators.GREATER_THAN,
      RSQLOperators.GREATER_THAN_OR_EQUAL,
      RSQLOperators.LESS_THAN,
      RSQLOperators.LESS_THAN_OR_EQUAL,
      RSQLOperators.IN,
      RSQLOperators.NOT_IN,
      RSQLOperators.IS_NULL,
      RSQLOperators.IS_NOT_NULL,
      RSQLOperators.COLUMN_EQUAL,
      RSQLOperators.COLUMN_NOT_EQUAL,
      RSQLOperators.LIKE,
      RSQLOperators.LIKE_RIGHT,
      RSQLOperators.LIKE_LEFT,
      RSQLOperators.NOT_LIKE,
      RSQLOperators.NOT_LIKE_RIGHT,
      RSQLOperators.NOT_LIKE_LEFT,
      RSQLOperators.BIT,
      RSQLOperators.NOT_BIT,
      RSQLOperators.HAS,
      RSQLOperators.NOT_HAS,
      RSQLOperators.HAS_OR,
      RSQLOperators.HAS_NOT_OR
    ]);
  }

  public static SINGLE_OPERATORS: RSQLComparisonOperator[];

  public static MAX_OPERATOR_SIZE: number;

  static {
    let maxSize = 0;
    const singleOperators: RSQLComparisonOperator[] = [];
    for (const operator of RSQLOperators.operators()) {
      if (!operator.isMulti) {
        singleOperators.push(operator);
      }
      for (const symbol of operator.symbols) {
        const l = symbol.length;
        if (maxSize < l) {
          maxSize = l;
        }
      }
    }
    RSQLOperators.MAX_OPERATOR_SIZE = maxSize;
    RSQLOperators.SINGLE_OPERATORS = singleOperators;
  }

  public static isSingle(operator: string): boolean {
    for (const singleOperator of RSQLOperators.SINGLE_OPERATORS) {
      if (singleOperator.isSymbolEquals(operator)) {
        return true;
      }
    }
    return false;
  }

  public static isMulti(operator: string): boolean {
    return RSQLOperators.IN.symbol === operator || RSQLOperators.NOT_IN.symbol === operator;
  }
}

/**
 * RSQL复合操作符
 */
export enum RSQLCompositeOperators {
  LIKE_OR = 'like_or',
  LIKE_AND = 'like_and',
  GE_LE = '=ge=,=le='
}
