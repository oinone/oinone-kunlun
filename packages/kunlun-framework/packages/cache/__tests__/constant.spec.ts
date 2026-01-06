import { DB_NAME, DB_VERSION } from '../index';

describe('cache 常量', () => {
  it('DB_NAME 与 DB_VERSION 使用默认值', () => {
    expect(DB_NAME).toBe('oio-db');
    expect(DB_VERSION).toBe(1);
  });
});
