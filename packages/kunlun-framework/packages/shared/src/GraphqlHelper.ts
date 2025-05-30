import { isNil } from 'lodash-es';

export class GraphqlHelper {
  private static SERIALIZABLE_CHARACTERS = ["'", '_', '%'];

  public static serializableString(s: string) {
    if (!s) {
      return s;
    }
    s = JSON.stringify(s);
    s = s.substring(1, s.length - 1);
    for (const val of GraphqlHelper.SERIALIZABLE_CHARACTERS) {
      s = s.split(val).join(`\\\\\\\\${val}`);
    }
    return s;
  }

  public static serializableSearchString(s: string) {
    if (!s) {
      return s;
    }
    s = s.split('\\').join('\\\\\\\\\\\\\\\\');
    for (const val of GraphqlHelper.SERIALIZABLE_CHARACTERS) {
      s = s.split(val).join(`\\\\\\${val}`);
    }
    return s;
  }

  public static serializableSimpleString(s: string) {
    if (!s) {
      return s;
    }
    s = JSON.stringify(s);
    return s.substring(1, s.length - 1);
  }

  public static serializableObject(obj: object) {
    let value = '';
    value = JSON.stringify(JSON.stringify(obj));
    value = value.substring(2, value.length - 2);
    value = `\{${value}\}`;
    return value;
  }

  public static serializableObjectArray(array: object[]) {
    let value = '';
    value = JSON.stringify(JSON.stringify(array));
    value = value.substring(2, value.length - 2);
    value = `[${value}]`;
    return value;
  }

  public static serializableStringArray(ss: string[]): string {
    let s;
    if (ss.length === 0) {
      s = '[]';
    } else {
      s = `["${ss.join('", "')}"]`;
    }
    return s;
  }

  public static serializableEnumerationArray(ss: string[]): string {
    let s;
    if (ss.length === 0) {
      s = '[]';
    } else {
      s = `[${ss.join(', ')}]`;
    }
    return s;
  }

  public static buildStringGQLParameter(key: string, value: string | undefined, serialize?: boolean) {
    if (isNil(value)) {
      return '';
    }
    if (serialize) {
      value = GraphqlHelper.serializableSimpleString(value);
    }
    return `${key}: "${value}"`;
  }

  public static buildNotStringGQLParameter(key: string, value: string | number | boolean | undefined) {
    if (isNil(value)) {
      return '';
    }
    return `${key}: ${value}`;
  }
}
