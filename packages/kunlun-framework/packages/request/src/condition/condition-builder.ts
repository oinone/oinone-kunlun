import { Condition, isCondition, ConditionConfig, ConditionType } from './condition';
import { StrControl } from './str-control';
import { RawValue, isRawValue } from './interface';

interface Entity {
  [key: string]: unknown;
}

// ConditionBuilder 中的 null 与空字符串需要把整个 key 清除
type StructValue = Condition | RawValue | string | number | boolean | null | undefined;

const isString = (v: unknown): v is string => typeof v === 'string';
const isUndefined = (v: unknown): v is undefined => typeof v === 'undefined';
const isNull = (v: unknown): v is null => v === null;

/**
 * cb.struct({ rsql: cb.condition('条件key').equal('条件val').and(cb.condition('cc').notEqual('dd)), size: 1 })
 */
class ConditionBuilder {
  public constructor(private config: ConditionConfig = { quote: "'" }) {}

  public static instance: ConditionBuilder;

  public static getInstance(): ConditionBuilder {
    if (!this.instance) {
      this.instance = new ConditionBuilder();
    }
    return this.instance;
  }

  // 返回对象结构字符串: `{ key: value }`
  public struct(args: { [props: string]: StructValue }): string {
    const query = new StrControl();
    query.prepend('{').postpend('}');

    Object.entries(args).forEach(([k, v], i, arr) => {
      if (this.isEmptyValue(v)) {
        return;
      }

      query.append(`${k}:`);
      if (isCondition(v) || isString(v)) {
        query.append(`"${v.toString()}"`);
      } else if (isRawValue(v)) {
        query.append(v.value);
      } else {
        query.append(`${v}`);
      }
      if (i + 1 < arr.length) {
        query.append(',');
      }
    });

    return query.toString();
  }

  // 返回 Condition 对象
  public condition(key: string, config?: ConditionConfig): Condition {
    return new Condition(key, config || this.config);
  }

  // 返回逗号分割字符串
  public comma(...values: string[]): string {
    return values.join(',');
  }

  // 返回聚合协议字符串
  public aggs(condition?: { field: string; method: string; alias: string }) {
    return condition ? `${condition.field}=${condition.method}=${condition.alias}` : '';
  }

  // 返回主键拼接 Condition
  public pk(pk: string[], data: Entity) {
    if (!pk.length) {
      throw new Error(`Primary key joint error, there's no primary key`);
    }
    const condition: Condition = this.condition(pk.shift()!);

    pk.forEach((k) => {
      const value = data[k];
      if (isUndefined(value)) {
        throw new Error(`Primary key joint error, undefined value of ${k},\n data: ${data}`);
      }

      const nextCondition = this.condition(k);
      nextCondition.equal(value as ConditionType);
      condition.and(nextCondition);
    });

    return condition;
  }

  public raw(value: string) {
    return new RawValue(value);
  }

  private isEmptyValue(v: StructValue) {
    return v === '' || isNull(v) || isUndefined(v) || (isRawValue(v) && v.value === '');
  }
}

export { ConditionBuilder, StructValue };
