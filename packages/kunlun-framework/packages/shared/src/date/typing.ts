export enum DateTimePickerMode {
  datetime = 'datetime',
  date = 'date',
  time = 'time',
  year = 'year',
  month = 'month',
  week = 'week'
}

export interface ResourceDateTimeOption {
  displayName: string; // 展示名称
  showName?: string; // 显示名称，如果没有就读取 displayName
  concat?: string; // 连接符
  code: string; // 格式化编码
  id: string; // id
  options?: ResourceDateTimeOption[];
  [key: string]: unknown;
}
