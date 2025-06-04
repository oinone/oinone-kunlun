import { ActionDslDefinition, FieldDslDefinition } from '@oinone/kunlun-dsl';
import { isObject } from 'lodash-es';
import { RuntimeContext } from '../runtime-context';

export class ResolveUtil {
  public static toArray<T = string>(val: string | string[] | undefined, split = ','): T[] | undefined {
    let array: string[] | undefined;
    if (Array.isArray(val)) {
      array = val.map((v) => v?.trim?.()).filter((v) => !!v);
    }
    if (typeof val === 'string') {
      array = val
        .split(split)
        .map((v) => v.trim())
        .filter((v) => !!v);
    }
    return array as unknown as T[];
  }

  public static toNumberOrStringNullable(val: string | number | undefined): string | number | undefined {
    if (typeof val === 'number') {
      return val;
    }
    if (typeof val === 'string') {
      if (val === 'Infinity') {
        return Infinity;
      }
      if (val === '-Infinity') {
        return -Infinity;
      }
      const num = Number(val);
      if (!Number.isNaN(num)) {
        return num;
      }
    }
    return val;
  }

  public static toNumberOrString(val: string | number | undefined, defaultValue: number): string | number {
    const value = ResolveUtil.toNumberOrStringNullable(val);
    if (value == null) {
      return defaultValue;
    }
    return value;
  }

  public static toNumberNullable(val: string | number | undefined): number | undefined {
    const value = ResolveUtil.toNumberOrStringNullable(val);
    if (typeof value === 'string') {
      console.warn(`${val} do not convert to number.`);
      return undefined;
    }
    return value;
  }

  public static toNumber(val: string | number | undefined, defaultValue: number): number {
    const value = ResolveUtil.toNumberNullable(val);
    if (value == null) {
      return defaultValue;
    }
    return value;
  }

  public static toRecord(val: string | Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        console.error(`Don't convert record.`, val, e);
        return undefined;
      }
    }
    return val;
  }

  public static getAndRepairModel(
    runtimeContext: RuntimeContext,
    dsl: FieldDslDefinition | ActionDslDefinition,
    options?: { verifyModelConsistency?: boolean }
  ): string | undefined {
    const modelModel = runtimeContext.model.model;
    const model = dsl.model || modelModel;
    if (options?.verifyModelConsistency && model !== modelModel) {
      return undefined;
    }
    dsl.model = model;
    return model;
  }

  public static clearUndefined(val: object | unknown[] | undefined) {
    if (Array.isArray(val)) {
      ResolveUtil.clearArrayUndefined(val);
    } else if (isObject(val)) {
      ResolveUtil.clearObjectUndefined(val as object);
    }
  }

  public static clearObjectUndefined(obj: object) {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined) {
        delete obj[key];
      }
      if (Array.isArray(value)) {
        ResolveUtil.clearArrayUndefined(value);
      } else if (isObject(value)) {
        ResolveUtil.clearObjectUndefined(value);
      }
    });
  }

  public static clearArrayUndefined(array: unknown[]) {
    let len = array.length;
    for (let i = 0; i < len; i++) {
      const val = array[i];
      if (val === undefined) {
        array.splice(i, 1);
        i--;
        len--;
      } else if (Array.isArray(val)) {
        ResolveUtil.clearArrayUndefined(val);
      } else if (isObject(val)) {
        ResolveUtil.clearObjectUndefined(val);
      }
    }
  }
}
