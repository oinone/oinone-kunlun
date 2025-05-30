import { isString } from 'lodash-es';

export function toRecord(record: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!record) {
    return {};
  }
  const result: Record<string, unknown> = {};
  Object.entries(record).forEach(([key, value]) => {
    let isSetting = false;
    if (isString(value)) {
      const likeJSON: string = value.trim();
      if (likeJSON[0] === '{' && likeJSON[likeJSON.length - 1] === '}') {
        result[key] = JSON.parse(value);
        isSetting = true;
      }
    }
    if (!isSetting) {
      result[key] = value;
    }
  });
  return result;
}
