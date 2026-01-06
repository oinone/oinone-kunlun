import { sortByPriorityOrOtherKey, isEqualTwoArray } from '../src/helper/tool';
import {
  convertDecimalPointToDot,
  filterNumberAndDecimalPoint,
  trimDoubleQuote,
  trimSingleQuote
} from '../src/helper/formatter';
import { devLogger, logger } from '../src/log';

jest.mock('@oinone/kunlun-router', () => {
  return {
    isDev: jest.fn().mockReturnValue(true)
  };
});

describe('helper tool', () => {
  it('sortByPriorityOrOtherKey sorts by priority and keeps negatives last', () => {
    const arr = [{ name: 'a', priority: 2 }, { name: 'b', priority: 1 }, { name: 'c', priority: -1 }, { name: 'd' }];
    const sorted = sortByPriorityOrOtherKey(arr);
    expect(sorted.map((item) => item.name)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('isEqualTwoArray compares arrays ignoring order for basic types', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [3, 2, 1];
    expect(isEqualTwoArray(arr1, arr2)).toBe(true);
  });
});

describe('helper formatter', () => {
  it('filterNumberAndDecimalPoint and convertDecimalPointToDot normalize numeric string', () => {
    const basicsConfig = { decimalPoint: ',' } as any;
    const raw = '1a2,3b';
    const filtered = filterNumberAndDecimalPoint(basicsConfig, raw);
    expect(filtered).toBe('12,3');
    const converted = convertDecimalPointToDot(basicsConfig, filtered);
    expect(converted).toBe('12.3');
  });

  it('trimSingleQuote and trimDoubleQuote remove surrounding quotes', () => {
    expect(trimSingleQuote("'abc'")).toBe('abc');
    expect(trimSingleQuote("''abc''")).toBe('abc');
    expect(trimDoubleQuote('"abc"')).toBe('abc');
    expect(trimDoubleQuote('""abc""')).toBe('abc');
  });
});

describe('logger', () => {
  it('logger delegates to console.log without env check', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    logger.log('message', { a: 1 });
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('devLogger logs only when isDev is true', () => {
    const { isDev } = require('@oinone/kunlun-router') as { isDev: jest.Mock };
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    isDev.mockReturnValue(false);
    devLogger.log('should not log');
    expect(logSpy).not.toHaveBeenCalled();

    isDev.mockReturnValue(true);
    devLogger.log('should log');
    expect(logSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
  });
});
