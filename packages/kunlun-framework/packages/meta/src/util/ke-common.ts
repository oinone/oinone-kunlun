/**
 * 判断对象(特指除下划线外的属性的对象，所以取名为keObject)是否为空
 * @param value
 */
const isEmptyKeObject = (value: any): boolean => {
  if (value === false || value === 0) {
    return false;
  }
  if (!value) {
    return true;
  }
  if (value instanceof Object) {
    if (Object.keys((value as Record<string, unknown>) || {}).length === 0) {
      return true;
    }
    // 老版本的代码这样判断的，猜测是 _ 开头的属于前端定义有特殊意义的属性，所以不算是业务对象的属性
    const keys = Object.keys((value as Record<string, unknown>) || {}).filter((name) => !name.startsWith('_'));
    return keys.length === 0;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
};
export { isEmptyKeObject };
