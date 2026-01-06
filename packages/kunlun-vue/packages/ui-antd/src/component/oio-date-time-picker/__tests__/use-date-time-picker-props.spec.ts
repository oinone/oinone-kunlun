import { DateTimePickerMode } from '@oinone/kunlun-shared';

import { fetchDatetimePickerPlaceholder } from '../index';

describe('fetchDatetimePickerPlaceholder', () => {
  it('根据不同模式返回正确的占位文案', () => {
    expect(fetchDatetimePickerPlaceholder(DateTimePickerMode.date)).toBe('请选择日期');
    expect(fetchDatetimePickerPlaceholder(DateTimePickerMode.time)).toBe('请选择时间');
    expect(fetchDatetimePickerPlaceholder(DateTimePickerMode.year)).toBe('请选择年份');
    expect(fetchDatetimePickerPlaceholder(DateTimePickerMode.month)).toBe('请选择月份');
    expect(fetchDatetimePickerPlaceholder(DateTimePickerMode.week)).toBe('请选择周');
  });

  it('未指定模式时返回日期时间占位文案', () => {
    expect(fetchDatetimePickerPlaceholder(DateTimePickerMode.datetime)).toBe('请选择日期时间');
  });
});
