export const COLLECTION_FUNCTION = {
  LIST_GET,
  LIST_IS_EMPTY,
  LIST_CONTAINS,
  LIST_ADD,
  LIST_ADD_BY_INDEX,
  LIST_REMOVE,
  LIST_COUNT,
  LIST_IDS,
  LIST_FIELD_VALUES,
  LIST_FIELD_EQUALS,
  LIST_FIELD_NOT_EQUALS,
  LIST_FIELD_IN,
  LIST_FIELD_NOT_IN,
  LIST_AND,
  LIST_OR,
  STRING_LIST_TO_NUMBER_LIST,
  COMMA,
  CONCAT,
  MAP_GET,
  MAP_IS_EMPTY,
  MAP_CONTAINS_KEY,
  MAP_PUT,
  MAP_REMOVE,
  MAP_COUNT
};

function LIST_GET(list: unknown[], index: number) {
  if (list == null) {
    return list;
  }
  return list[index];
}

function LIST_IS_EMPTY(list: unknown[]) {
  if (list == null) {
    return true;
  }
  return list.length === 0;
}

function LIST_CONTAINS(list: unknown[], item: unknown) {
  const index = list?.findIndex((i) => JSON.stringify(i) === JSON.stringify(item));
  return index != null && index !== -1;
}

function LIST_ADD(list: unknown[], item: unknown) {
  list.push(item);
  return list;
}

function LIST_ADD_BY_INDEX(list: unknown[], index: number, item: unknown) {
  if (list == null && index == null) {
    return list;
  }
  return list.splice(index, 0, item);
}

function LIST_REMOVE(list: unknown[], item: unknown) {
  if (list == null) {
    return list;
  }
  if (item == null) {
    return list;
  }
  const index = list.findIndex((i) => JSON.stringify(i) === JSON.stringify(item));
  if (index !== -1) {
    list.splice(index, 1);
  }
  return list;
}

function LIST_COUNT(list: unknown[]) {
  if (list == null) {
    return 0;
  }
  return list.length;
}

function LIST_IDS(list: unknown[]) {
  return LIST_FIELD_VALUES(list, undefined, 'id');
}

/**
 * 收集列表属性值
 * @param list 列表
 * @param model 前端无用字段，与后端函数入参保持一致
 * @param fieldName 字段名称，IModelField#name
 */
function LIST_FIELD_VALUES(list: unknown[] | undefined, model: string | undefined, fieldName: string | undefined) {
  if (list == null || fieldName == null) {
    return list;
  }
  return list
    .filter((item) => (item as Record<string, unknown>)[fieldName] != null)
    .map((item) => (item as Record<string, unknown>)[fieldName]);
}

function LIST_FIELD_EQUALS(list: Record<string, unknown>[], model: string, name: string, value: unknown) {
  return list?.map((i) => JSON.stringify(i[name]) === JSON.stringify(value)) || [];
}

function LIST_FIELD_NOT_EQUALS(list: Record<string, unknown>[], model: string, name: string, value: unknown) {
  return list?.map((i) => JSON.stringify(i[name]) !== JSON.stringify(value)) || [];
}

function LIST_FIELD_IN(list: Record<string, unknown>[], model: string, name: string, targetList: unknown[]) {
  return (
    targetList?.map((val) => {
      if (!val) {
        return false;
      }
      const targetVal = JSON.stringify(val);
      return !!list
        .map((v) => {
          const item = v[name];
          if (item) {
            return JSON.stringify(item);
          }
          return undefined;
        })
        .find((v) => v === targetVal);
    }) || []
  );
}

function LIST_FIELD_NOT_IN(list: Record<string, unknown>[], model: string, name: string, targetList: unknown[]) {
  return (
    targetList?.map((val) => {
      if (!val) {
        return true;
      }
      const targetVal = JSON.stringify(val);
      return !list
        .map((v) => {
          const item = v[name];
          if (item) {
            return JSON.stringify(item);
          }
          return undefined;
        })
        .find((v) => v === targetVal);
    }) || []
  );
}

function LIST_AND(list: unknown[]) {
  list = list || [];
  if (!list.length) {
    return false;
  }
  for (const item of list) {
    if (!item) {
      return false;
    }
  }
  return true;
}

function LIST_OR(list: unknown[]) {
  list = list || [];
  if (!list.length) {
    return false;
  }
  for (const item of list) {
    if (item) {
      return true;
    }
  }
  return false;
}

function STRING_LIST_TO_NUMBER_LIST(list: unknown[]) {
  list = list || [];
  const numberList: number[] = [];
  for (const item of list) {
    const number = Number(item);
    if (Number.isNaN(number)) {
      return list;
    }
    numberList.push(number);
  }
  return numberList;
}

function COMMA(list: unknown[]) {
  return (list || [])
    .map((value) => {
      if (typeof value === 'number') {
        return `${value}`;
      }
      return value;
    })
    .join(',');
}

function CONCAT(list: unknown[], split: string) {
  return (list || []).join(split);
}

function MAP_GET(obj: Record<string, unknown>, key: string) {
  if (obj == null) {
    return obj;
  }
  return obj[key];
}

function MAP_IS_EMPTY(obj: Record<string, unknown>) {
  if (obj == null) {
    return obj;
  }
  return Object.keys(obj).length === 0;
}

function MAP_CONTAINS_KEY(obj: Record<string, unknown>, key: string) {
  return Object.keys(obj).includes(key);
}

function MAP_PUT(obj: Record<string, unknown>, key: string, value: unknown) {
  if (obj == null) {
    return obj;
  }
  obj[key] = value;
  return obj;
}

function MAP_REMOVE(obj: Record<string, unknown>, key: string) {
  if (obj == null) {
    return obj;
  }
  const value = obj[key];
  delete obj[key];
  return value;
}

function MAP_COUNT(obj: Record<string, unknown>) {
  if (obj == null) {
    return 0;
  }
  return Object.keys(obj).length;
}
