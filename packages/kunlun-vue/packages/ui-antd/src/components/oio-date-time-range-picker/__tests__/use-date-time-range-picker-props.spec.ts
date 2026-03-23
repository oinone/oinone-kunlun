import { DateTimePickerMode } from '@oinone/kunlun-shared';

import { fetchDatetimeRangePickerPlaceholder } from '../index';

describe('fetchDatetimeRangePickerPlaceholder', () => {
  it('根据不同模式返回正确的区间占位文案', () => {
    expect(fetchDatetimeRangePickerPlaceholder(DateTimePickerMode.datetime)).toEqual(['开始时间', '结束时间']);
    expect(fetchDatetimeRangePickerPlaceholder(DateTimePickerMode.time)).toEqual(['开始时间', '结束时间']);
    expect(fetchDatetimeRangePickerPlaceholder(DateTimePickerMode.year)).toEqual(['开始年份', '结束年份']);
    expect(fetchDatetimeRangePickerPlaceholder(DateTimePickerMode.month)).toEqual(['开始月份', '结束月份']);
    expect(fetchDatetimeRangePickerPlaceholder(DateTimePickerMode.week)).toEqual(['开始周', '结束周']);
  });

  it('未指定模式时返回日期区间占位文案', () => {
    expect(fetchDatetimeRangePickerPlaceholder(DateTimePickerMode.date)).toEqual(['开始日期', '结束日期']);
  });
});
