import { isNil, isString } from 'lodash-es';
import { ActiveRecord, ActiveRecordExtendKeys, DeleteEntity, UpdateEntity } from '../typing';
import { deepClone } from '@oinone/kunlun-meta';

/**
 * 提交模型
 */
export interface SubmitModel {
  model: string;
  pks?: string[];
  uniques?: string[][];
}

/**
 * 提交操作
 */
enum SubmitOperator {
  PUSH = 'PUSH',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

/**
 * 操作项
 */
interface OperatorItem {
  operator: SubmitOperator;
}

/**
 * 添加记录操作项
 */
interface PushOperatorItem extends OperatorItem {
  records: ActiveRecord[];
}

/**
 * 更新记录操作项
 */
interface UpdateOperatorItem extends OperatorItem {
  record: ActiveRecord;
  index: number;
}

/**
 * 删除记录操作项
 */
interface DeleteOperatorItem extends OperatorItem {
  record: ActiveRecord;
  index: number;
}

/**
 * 单次操作项
 */
type Operator = PushOperatorItem | UpdateOperatorItem | DeleteOperatorItem;

/**
 * 提交缓存管理器
 */
export class SubmitCacheManager {
  /**
   * 提交模型
   * @private
   */
  private readonly model: SubmitModel;

  /**
   * 去重字段
   * @private
   */
  private equalKeys: string[][] | undefined;

  /**
   * 操作队列
   * @private
   */
  private operatorQueue: Operator[];

  /**
   * 新增记录结果集
   * @private
   */
  private pushRecordResult: ActiveRecord[] = [];

  /**
   * 更新记录结果集
   * @private
   */
  private updateRecordResult: ActiveRecord[] = [];

  /**
   * 删除记录结果集
   * @private
   */
  private deleteRecordResult: ActiveRecord[] = [];

  /**
   * 自定义去重字段
   */
  private excludes: string[] = [];

  public constructor(model: SubmitModel) {
    this.model = model;
    this.operatorQueue = [];
    this.pushRecordResult = [];
    this.updateRecordResult = [];
    this.deleteRecordResult = [];
  }

  public reload() {
    this.operatorQueue = [];
    this.pushRecordResult = [];
    this.updateRecordResult = [];
    this.deleteRecordResult = [];
  }

  public getModel() {
    return this.model;
  }

  public getExcludes() {
    return this.excludes;
  }

  public setExcludes(excludes: string | string[]) {
    if (excludes) {
      if (isString(excludes)) {
        this.excludes = excludes.split(',').filter((v) => !!v);
      } else {
        this.excludes = excludes;
      }
    } else {
      this.excludes = [];
    }
  }

  public pushRecord(data: ActiveRecord) {
    this.pushRecords([data]);
  }

  public pushRecords(data: ActiveRecord[]) {
    data.forEach((value) => {
      const pushItem: PushOperatorItem = {
        operator: SubmitOperator.PUSH,
        records: [value]
      };
      if (this.predictOperatorRecord(value, SubmitOperator.PUSH)) {
        this.operatorQueue.push(pushItem);
        this.pushRecordResult.push(value);
      }
    });
  }

  public updateRecord(data: UpdateEntity) {
    this.updateRecords([data]);
  }

  public updateRecords(data: UpdateEntity[]) {
    data.forEach((item) => {
      const { value, index } = item;
      const updateItem: UpdateOperatorItem = {
        operator: SubmitOperator.UPDATE,
        record: value,
        index
      };
      this.operatorQueue.push(updateItem);
      if (this.predictOperatorRecord(value, SubmitOperator.UPDATE)) {
        this.updateRecordResult.push(value);
      }
    });
  }

  public deleteRecord(data: DeleteEntity) {
    this.deleteRecords([data]);
  }

  public deleteRecords(data: DeleteEntity[]) {
    data.forEach((item) => {
      const { value, index } = item;
      const deleteItem: DeleteOperatorItem = {
        operator: SubmitOperator.DELETE,
        record: value,
        index
      };
      this.operatorQueue.push(deleteItem);
      if (this.predictOperatorRecord(value, SubmitOperator.DELETE)) {
        this.deleteRecordResult.push(value);
      }
    });
  }

  protected predictOperatorRecord(value: ActiveRecord, operator: SubmitOperator): boolean {
    const pushRecordResultLength = this.pushRecordResult.length;
    let i = 0;
    for (; i < pushRecordResultLength; i++) {
      const pushRecord = this.pushRecordResult[i];
      if (this.isEquals(value, pushRecord)) {
        break;
      }
    }
    if (i !== pushRecordResultLength) {
      switch (operator) {
        case SubmitOperator.PUSH:
          break;
        case SubmitOperator.UPDATE:
          this.pushRecordResult.splice(i, 1, value);
          break;
        case SubmitOperator.DELETE:
          this.pushRecordResult.splice(i, 1);
          break;
      }
      return false;
    }
    const updateRecordResultLength = this.updateRecordResult.length;
    i = 0;
    for (; i < updateRecordResultLength; i++) {
      const updateRecord = this.updateRecordResult[i];
      if (this.isEquals(value, updateRecord)) {
        break;
      }
    }
    if (i !== updateRecordResultLength) {
      switch (operator) {
        case SubmitOperator.PUSH:
          break;
        case SubmitOperator.UPDATE:
          this.updateRecordResult.splice(i, 1, value);
          break;
        case SubmitOperator.DELETE:
          this.updateRecordResult.splice(i, 1);
          break;
      }
      return false;
    }
    return true;
  }

  public submit(origin: ActiveRecord[]): ActiveRecord[] {
    origin = deepClone(origin);
    this.operatorQueue.forEach((item) => {
      const { operator } = item;
      switch (operator) {
        case SubmitOperator.PUSH:
          origin = this.pushOperator(origin, item as PushOperatorItem);
          break;
        case SubmitOperator.UPDATE:
          origin = this.updateOperator(origin, item as UpdateOperatorItem).records;
          break;
        case SubmitOperator.DELETE:
          origin = this.deleteOperator(origin, item as DeleteOperatorItem).records;
          break;
        default:
          throw new Error(`Invalid submit operator value. value = ${operator}`);
      }
    });
    this.operatorQueue = [];
    return origin;
  }

  public getOperatorResult(): {
    operatorQueue: Operator[];
    createRecords: ActiveRecord[];
    updateRecords: ActiveRecord[];
    deleteRecords: ActiveRecord[];
  } {
    return {
      operatorQueue: this.operatorQueue,
      createRecords: this.pushRecordResult,
      updateRecords: this.updateRecordResult,
      deleteRecords: this.deleteRecordResult
    };
  }

  public clone(): SubmitCacheManager {
    const newInstance = new SubmitCacheManager(this.model);
    newInstance.excludes = this.excludes;
    return newInstance;
  }

  private pushOperator(origin: ActiveRecord[], operatorItem: PushOperatorItem): ActiveRecord[] {
    operatorItem.records.forEach((record) => {
      origin.push(record);
    });
    return origin;
  }

  private updateOperator(
    origin: ActiveRecord[],
    operatorItem: UpdateOperatorItem
  ): { result: boolean; records: ActiveRecord[] } {
    const updateIndex = origin.findIndex((v) => this.isEquals(v, operatorItem.record));
    if (updateIndex < 0) {
      return {
        result: false,
        records: origin
      };
    }
    const data = Object.assign(origin[updateIndex], operatorItem.record);
    origin.splice(updateIndex, 1, data);
    return {
      result: true,
      records: origin
    };
  }

  private deleteOperator(
    origin: ActiveRecord[],
    operatorItem: DeleteOperatorItem
  ): { result: boolean; records: ActiveRecord[] } {
    const deleteIndex = origin.findIndex((v) => this.isEquals(v, operatorItem.record));
    if (deleteIndex < 0) {
      return {
        result: false,
        records: origin
      };
    }
    origin.splice(deleteIndex, 1);
    return {
      result: true,
      records: origin
    };
  }

  private analysisEqualKeys(): string[][] {
    const equalKeys: string[][] = [];
    const pks = this.model.pks;
    if (this.excludes && this.excludes.length) {
      equalKeys.push(this.excludes);
    } else if (pks) {
      equalKeys.push(pks);
    }
    equalKeys.push([ActiveRecordExtendKeys.DRAFT_ID]);
    return equalKeys;
  }

  public isEquals(a: ActiveRecord, b: ActiveRecord) {
    if (!this.equalKeys) {
      this.equalKeys = this.analysisEqualKeys();
    }
    if (this.equalKeys.length) {
      for (const equalKey of this.equalKeys) {
        let result = true;
        for (const key of equalKey) {
          const va = a[key];
          const vb = b[key];
          if (isNil(va) || isNil(vb)) {
            result = false;
            break;
          }
          if (va !== vb) {
            result = false;
            break;
          }
        }
        if (result) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
}
