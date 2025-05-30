import { Entity } from '@kunlun/meta';
import { uniqueKeyGenerator } from '@kunlun/shared';
import { isArray, isNil } from 'lodash-es';
import {
  ActiveRecord,
  ActiveRecords,
  DeleteActiveRecordsByEntityPredict,
  DeleteEntity,
  PushActiveRecordsPredict,
  RepairOptions,
  UpdateActiveRecordsByEntityPredict,
  UpdateEntity
} from '../typing';
import { SubmitCacheManager } from './SubmitCacheManager';

interface OperatorFlag {
  data: ActiveRecord;
  flag: boolean;
}

export class ActiveRecordsOperator {
  public static DEFAULT_UPDATE_PREDICT = (oldVal, newVal) => oldVal.__draftId === newVal.__draftId;

  public static DEFAULT_DELETE_PREDICT = ActiveRecordsOperator.DEFAULT_UPDATE_PREDICT;

  private activeRecords: ActiveRecord[];

  private submitCache: SubmitCacheManager | undefined;

  private constructor(activeRecords: ActiveRecord[], submitCache?: SubmitCacheManager) {
    this.activeRecords = activeRecords;
    this.submitCache = submitCache;
  }

  public static operator(activeRecords: ActiveRecords | undefined, submitCache?: SubmitCacheManager) {
    return new ActiveRecordsOperator(ActiveRecordsOperator.repairRecords(activeRecords), submitCache);
  }

  public static defaultPushPredict(this: SubmitCacheManager, currentRecords: ActiveRecord[], record: ActiveRecord) {
    return !currentRecords.some((v) => this.isEquals(v, record));
  }

  public push(records: ActiveRecords | undefined, predict?: PushActiveRecordsPredict): ActiveRecordsOperator {
    records = ActiveRecordsOperator.repairRecords(records);
    const newActiveRecords: ActiveRecord[] = [];
    this.activeRecords.forEach((record) => {
      newActiveRecords.push(record);
    });
    records.forEach((record) => {
      if (predict) {
        if (predict(newActiveRecords, record)) {
          newActiveRecords.push(record);
          this.submitToCreateCache(record);
        }
      } else {
        newActiveRecords.push(record);
        this.submitToCreateCache(record);
      }
    });
    this.activeRecords = newActiveRecords;
    return this;
  }

  public update(records: UpdateEntity[]): ActiveRecordsOperator {
    records.forEach((v) => {
      this.activeRecords.splice(v.index, 1, v.value);
      this.submitToUpdateCache(v);
    });
    return this;
  }

  public updateByEntity(records: ActiveRecords, predict?: UpdateActiveRecordsByEntityPredict): ActiveRecordsOperator {
    if (!predict) {
      if (this.submitCache) {
        predict = this.submitCache.isEquals.bind(this.submitCache);
      } else {
        predict = ActiveRecordsOperator.DEFAULT_UPDATE_PREDICT;
      }
    }
    records = ActiveRecordsOperator.repairRecords(records);
    let cloneRecordsLength = records.length;
    const newActionRecords: ActiveRecord[] = [];
    const activeRecordsLength = this.activeRecords.length;
    for (let i = 0; i < activeRecordsLength; i++) {
      let activeRecord = this.activeRecords[i];
      if (!cloneRecordsLength) {
        newActionRecords.push(this.activeRecords[i]);
        // eslint-disable-next-line no-continue
        continue;
      }
      let k = 0;
      for (; k < cloneRecordsLength; k++) {
        const record = records[k];
        if (predict(activeRecord, record)) {
          activeRecord = record;
          break;
        }
      }
      if (k !== cloneRecordsLength) {
        cloneRecordsLength--;
        this.submitToUpdateCache({ value: activeRecord, index: i });
      }
      newActionRecords.push(activeRecord);
    }
    this.activeRecords = newActionRecords;
    return this;
  }

  public delete(recordIndexes: number[]): ActiveRecordsOperator {
    throw new Error('delete unsupported');
    // recordIndexes.forEach((v) => {
    //   const deleteRecords = this.activeRecords.splice(v, 1);
    //   const deleteRecord = deleteRecords[0];
    //   if (deleteRecord) {
    //     this.submitToDeleteCache({ value: deleteRecord, index: v });
    //   }
    // });
    // return this;
  }

  public deleteByEntity(records: ActiveRecords, predict?: DeleteActiveRecordsByEntityPredict): ActiveRecordsOperator {
    records = ActiveRecordsOperator.repairRecords(records);
    if (!predict) {
      if (this.submitCache) {
        predict = this.submitCache.isEquals.bind(this.submitCache);
      } else {
        predict = ActiveRecordsOperator.DEFAULT_DELETE_PREDICT;
      }
    }
    const cloneActiveRecords = [...this.activeRecords];
    records.forEach((record) => {
      const index = cloneActiveRecords.findIndex((v) => predict!(v, record));
      if (index !== -1) {
        const deleteRecord = cloneActiveRecords.splice(index, 1)[0];
        this.submitToDeleteCache({ value: deleteRecord, index });
      }
    });
    this.activeRecords = cloneActiveRecords;
    // const flags: OperatorFlag[] = [];
    // const recordsLength = records.length;
    // const newActionRecords: ActiveRecord[] = [];
    // const activeRecordsLength = this.activeRecords.length;
    // let i = 0;
    // for (; i < activeRecordsLength; i++) {
    //   if (!recordsLength) {
    //     newActionRecords.push(this.activeRecords[i]);
    //     // eslint-disable-next-line no-continue
    //     continue;
    //   }
    //   const activeRecord = this.activeRecords[i];
    //   let k = 0;
    //   for (; k < recordsLength; k++) {
    //     const record = records[k];
    //     let operatorFlag = flags[k];
    //     if (!operatorFlag) {
    //       operatorFlag = {
    //         data: record,
    //         flag: false
    //       };
    //       flags[k] = operatorFlag;
    //     }
    //     if (operatorFlag.flag) {
    //       // eslint-disable-next-line no-continue
    //       continue;
    //     }
    //     if (predict(activeRecord, record)) {
    //       operatorFlag.flag = true;
    //       break;
    //     }
    //   }
    //   if (k === recordsLength) {
    //     newActionRecords.push(activeRecord);
    //   } else {
    //     this.submitToDeleteCache({ value: activeRecord, index: i });
    //   }
    // }
    // this.activeRecords = newActionRecords;
    return this;
  }

  public get() {
    return this.activeRecords;
  }

  private submitToCache(consumer: (submitCache: SubmitCacheManager) => void) {
    const { submitCache } = this;
    if (submitCache) {
      consumer(submitCache);
    }
  }

  private submitToCreateCache(record: ActiveRecord) {
    this.submitToCache((submitCache) => {
      submitCache.pushRecord(record);
    });
  }

  private submitToUpdateCache(data: UpdateEntity) {
    this.submitToCache((submitCache) => {
      submitCache.updateRecord(data);
    });
  }

  private submitToDeleteCache(data: DeleteEntity) {
    this.submitToCache((submitCache) => {
      submitCache.deleteRecord(data);
    });
  }

  /**
   * 修复数据记录，并强制改为列表
   * @param records 数据记录
   * @param options 修复可选项
   * @return 数据记录列表
   */
  public static repairRecords(records: Entity | Entity[] | null | undefined, options?: RepairOptions): ActiveRecord[] {
    if (isNil(records)) {
      return [];
    }
    return ActiveRecordsOperator.convertActiveRecords(records, options);
  }

  /**
   * 修复数据记录，并强制改为列表（返回值可能为空）
   * @param records 数据记录
   * @param options 修复可选项
   * @return 数据记录列表
   */
  public static repairRecordsNullable(
    records: Entity | Entity[] | undefined,
    options?: RepairOptions
  ): ActiveRecord[] | undefined {
    if (isNil(records)) {
      return records;
    }
    return ActiveRecordsOperator.convertActiveRecords(records, options);
  }

  private static convertActiveRecords(records: Entity | Entity[], options?: RepairOptions): ActiveRecord[] {
    if (!isArray(records)) {
      records = [records];
    }
    let fillDraftId = options?.fillDraftId;
    if (isNil(fillDraftId)) {
      fillDraftId = true;
    }
    const repairOptions: RepairOptions = {
      ...(options || {}),
      fillDraftId
    };
    return records.map((record) => ActiveRecordsOperator.repairActiveRecord(record, repairOptions)!);
  }

  public static convertActiveRecord(record: Entity | undefined, fillDraftId = true): ActiveRecord | undefined {
    if (!record) {
      return record;
    }
    if (fillDraftId && !record.__draftId) {
      record.__draftId = uniqueKeyGenerator();
    }
    return record as ActiveRecord;
  }

  private static repairActiveRecord(record: Entity | undefined, options: RepairOptions): ActiveRecord | undefined {
    if (!record) {
      return record;
    }
    const activeRecord = record as ActiveRecord;
    const { fillDraftId, parentDraftId, hasChildren } = options;
    if (fillDraftId && !activeRecord.__draftId) {
      activeRecord.__draftId = uniqueKeyGenerator();
    }
    if (parentDraftId) {
      activeRecord.__parentDraftId = parentDraftId;
    }
    if (hasChildren) {
      activeRecord.__hasChildren = true;
    }
    return activeRecord;
  }
}
