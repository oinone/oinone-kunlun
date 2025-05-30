import { UserTablePreferFieldWidth, UserTablePrefer } from '../typing';

/**
 *  获取table列的宽度
 */
export const getTableColumnWidth = (
  fieldWidth: UserTablePreferFieldWidth[] | undefined,
  field: string,
  defaultValue: number | string | undefined
) => {
  if (fieldWidth && fieldWidth.length) {
    const match = fieldWidth.find((f) => f.field === field);
    return match ? `${match.width}px` : defaultValue;
  }

  return defaultValue;
};

/**
 *  获取table列的最小宽度
 */
export const getTableColumnMinWidth = () => {
  return '120';
};

/**
 *  获取table列的固定位置
 */
export const getTableColumnFixed = (
  userTablePrefer: UserTablePrefer,
  field: string,
  defaultValue: string | boolean | undefined = undefined
) => {
  const { fieldLeftFixed = [], fieldRightFixed = [] } = userTablePrefer;

  if (fieldLeftFixed.includes(field)) {
    return 'left';
  }
  if (fieldRightFixed.includes(field)) {
    return 'right';
  }

  return defaultValue;
};
