import { RuntimeModel } from '@oinone/kunlun-engine';
import { Entity, IModel, IModelField } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { getModel, queryOne } from '@oinone/kunlun-service';
import { ObjectUtils } from '@oinone/kunlun-shared';

export class FunctionConstant {
  public static readonly FUNCTION_DEFINITION = 'base.Function';
}

export class FetchUtil {
  public static async fetchOne<T>(
    modelModel: string,
    data: T,
    fields?: IModelField[],
    variables?: Entity,
    context: Entity = {}
  ): Promise<T | undefined> {
    if (!data) {
      return data;
    }
    const modelDefinition: IModel = await getModel(modelModel);
    let isBroken = false;
    const params = {};
    const pks = modelDefinition.pk;
    for (let pk in pks) {
      pk = pk.trim();
      const pkValue = data[pk.trim()];
      if (pkValue) {
        params[pk] = pkValue;
      } else {
        isBroken = true;
        break;
      }
    }
    if (!isBroken) {
      return (await queryOne(modelModel, params, fields, variables, context)) as T;
    }
    return undefined;
  }

  /**
   * 生成仅包含pks的对象
   * @param model 模型
   * @param record 数据记录
   */
  public static generatorPksObject(
    model: RuntimeModel,
    record: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    return FetchUtil.generatorPksObjectByPks(model.pks, record);
  }

  /**
   * 生成仅包含pks的对象
   * @param pks 模型pks定义
   * @param record 数据记录
   */
  public static generatorPksObjectByPks(pks: string[] | undefined, record: Record<string, unknown>) {
    if (!pks || !pks.length) {
      return undefined;
    }
    let { length } = pks;
    const pksObject: Record<string, unknown> = {};
    pks.forEach((pkField) => {
      const pkValue = record[pkField];
      if (pkValue != null) {
        pksObject[pkField] = pkValue;
        length--;
      }
    });
    if (length === 0) {
      return pksObject;
    }
  }

  /**
   * 生成仅包含pks和uniques的对象
   * @param model 模型
   * @param record 数据记录
   */
  public static generatorUniqueObject(model: RuntimeModel, record: Record<string, unknown>) {
    const uniqueObject: Record<string, unknown> = {};
    const uniqueFieldSet = new Set<string>();
    model.uniques?.forEach((uniqueFields) => {
      uniqueFields.forEach((uniqueField) => {
        if (ObjectUtils.isRepeat(uniqueFieldSet, uniqueField)) {
          return;
        }
        const uniqueValue = record[uniqueField];
        if (uniqueValue != null) {
          uniqueObject[uniqueField] = uniqueValue;
        }
      });
    });
    model.pks?.forEach((pkField) => {
      const pkValue = record[pkField];
      if (pkValue != null) {
        uniqueObject[pkField] = pkValue;
      }
    });
    return uniqueObject;
  }

  public static generatorSimpleCondition(obj: object): Condition | undefined {
    let condition: Condition | undefined;
    for (const [key, value] of Object.entries(obj)) {
      const newCondition = () => {
        return new Condition(key).equal(`${value}`);
      };
      if (condition) {
        condition = condition.and(newCondition());
      } else {
        condition = newCondition();
      }
    }
    return condition;
  }

  public static generatorInCondition(list: object[], key: string): Condition | undefined {
    const values = list.map((item) => item[key] as string).filter((v) => !!v);
    if (values.length) {
      return new Condition(key).in(values);
    }
  }

  public static generatorNotInCondition(list: object[], key: string): Condition | undefined {
    const values = list.map((item) => item[key] as string).filter((v) => !!v);
    if (values.length) {
      return new Condition(key).notIn(values);
    }
  }
}
