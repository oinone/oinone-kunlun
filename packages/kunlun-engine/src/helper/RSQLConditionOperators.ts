import { Condition, DefaultComparisonOperator } from '@oinone/kunlun-request';

export type RSQLConditionConsumer = (selector: string, value: string, isPreprocess?: boolean) => Condition;

export interface RSQLConditionOperator {
  symbols: string[];
  consumer: RSQLConditionConsumer;
}

export type RSQLValueType = 'string' | 'number' | 'boolean' | 'datetime' | 'bit';

const GREATER_THAN = [DefaultComparisonOperator.GREATER_THAN, '>'];

const GREATER_THAN_OR_EQUAL = [DefaultComparisonOperator.GREATER_THAN_OR_EQUAL, '>='];

const LESS_THAN = [DefaultComparisonOperator.LESS_THAN, '<'];

const LESS_THAN_OR_EQUAL = [DefaultComparisonOperator.LESS_THAN_OR_EQUAL, '<='];

export class RSQLConditionOperators {
  private static operators: RSQLConditionOperator[] = [
    {
      symbols: [DefaultComparisonOperator.EQUAL],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).equal(value, isPreprocess)
    },
    {
      symbols: [DefaultComparisonOperator.NOT_EQUAL],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).notEqual(value, isPreprocess)
    },
    {
      symbols: GREATER_THAN,
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).greaterThan(value, isPreprocess)
    },
    {
      symbols: GREATER_THAN_OR_EQUAL,
      consumer: (selector, value, isPreprocess = true) =>
        new Condition(selector).greaterThanOrEuqalTo(value, isPreprocess)
    },
    {
      symbols: LESS_THAN,
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).lessThan(value, isPreprocess)
    },
    {
      symbols: LESS_THAN_OR_EQUAL,
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).lessThanOrEqualTo(value, isPreprocess)
    },
    {
      symbols: [DefaultComparisonOperator.IN],
      consumer: (selector, value) => new Condition(selector).in(value)
    },
    {
      symbols: [DefaultComparisonOperator.NOT_IN],
      consumer: (selector, value) => new Condition(selector).notIn(value)
    },
    {
      symbols: [DefaultComparisonOperator.COL_EQUAL],
      consumer: (selector, value) => new Condition(selector).colEqual(value)
    },
    {
      symbols: [DefaultComparisonOperator.COL_NOT_EQUAL],
      consumer: (selector, value) => new Condition(selector).colNotEqual(value)
    },
    {
      symbols: [DefaultComparisonOperator.LIKE],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).like(value, isPreprocess)
    },
    {
      symbols: [DefaultComparisonOperator.STARTS],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).starts(value, isPreprocess)
    },
    {
      symbols: [DefaultComparisonOperator.ENDS],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).ends(value, isPreprocess)
    },
    {
      symbols: [DefaultComparisonOperator.NOT_LIKE],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).notLike(value, isPreprocess)
    },
    {
      symbols: [DefaultComparisonOperator.NOT_STARTS],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).notStarts(value, isPreprocess)
    },
    {
      symbols: [DefaultComparisonOperator.NOT_ENDS],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).notEnds(value, isPreprocess)
    },
    {
      symbols: [DefaultComparisonOperator.BIT],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).bitEqual(value)
    },
    {
      symbols: [DefaultComparisonOperator.NOT_BIT],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).bitNotEqual(value)
    },
    {
      symbols: [DefaultComparisonOperator.HAS],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).has(value)
    },
    {
      symbols: [DefaultComparisonOperator.HAS_NOT],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).hasNot(value)
    },
    {
      symbols: [DefaultComparisonOperator.HAS_OR],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).hasOr(value)
    },
    {
      symbols: [DefaultComparisonOperator.HAS_NOT_OR],
      consumer: (selector, value, isPreprocess = true) => new Condition(selector).hasNotOr(value)
    }
  ];

  public static get(type: RSQLValueType, operator: string) {
    let supportedOperators: string[] | undefined;
    switch (type) {
      case 'string':
        supportedOperators = [
          DefaultComparisonOperator.EQUAL,
          DefaultComparisonOperator.NOT_EQUAL,
          DefaultComparisonOperator.IN,
          DefaultComparisonOperator.NOT_IN,
          DefaultComparisonOperator.LIKE,
          DefaultComparisonOperator.STARTS,
          DefaultComparisonOperator.ENDS,
          DefaultComparisonOperator.NOT_LIKE,
          DefaultComparisonOperator.NOT_STARTS,
          DefaultComparisonOperator.NOT_ENDS
        ];
        break;
      case 'number':
      case 'datetime':
        supportedOperators = [
          DefaultComparisonOperator.EQUAL,
          DefaultComparisonOperator.NOT_EQUAL,
          ...GREATER_THAN,
          ...GREATER_THAN_OR_EQUAL,
          ...LESS_THAN,
          ...LESS_THAN_OR_EQUAL
        ];
        break;
      case 'boolean':
        supportedOperators = [DefaultComparisonOperator.EQUAL, DefaultComparisonOperator.NOT_EQUAL];
        break;
      case 'bit':
        supportedOperators = [
          DefaultComparisonOperator.EQUAL,
          DefaultComparisonOperator.NOT_EQUAL,
          DefaultComparisonOperator.BIT,
          DefaultComparisonOperator.NOT_BIT,
          DefaultComparisonOperator.HAS,
          DefaultComparisonOperator.HAS_NOT,
          DefaultComparisonOperator.HAS_OR,
          DefaultComparisonOperator.HAS_NOT_OR
        ];
        break;
    }
    if (supportedOperators) {
      if (!supportedOperators.includes(operator)) {
        return undefined;
      }
    }
    return RSQLConditionOperators.operators.find((v) => v.symbols.some((vv) => vv === operator))?.consumer;
  }
}
