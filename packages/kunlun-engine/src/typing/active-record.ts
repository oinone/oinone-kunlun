import { JSONUtils } from '@kunlun/shared';

export interface ActiveRecord {
  // 数据在前端的唯一标识
  __draftId?: string;
  __parentDraftId?: string;
  __hasChildren?: boolean;
  // 数据的最后一次更新是否来自前端
  __lastUpdateFromLocal?: boolean;
  // 数据更新的时间戳，FIXME 临时解决弹窗内数据更新后不刷新 TableOperationColumn内子组件数据的问题
  __updateTimestamp?: string;

  [key: string]: unknown;
}

export const ActiveRecordExtendKeys = {
  DRAFT_ID: '__draftId',
  PARENT_DRAFT_ID: '__parentDraftId',
  HAS_CHILDREN: '__hasChildren',
  LAST_UPDATE_FROM_LOCAL: '__lastUpdateFromLocal',
  UPDATE_TIMESTAMP: '__updateTimestamp'
};

export type ActiveRecords = ActiveRecord | ActiveRecord[];

export function activeRecordsToJSONString(activeRecords: ActiveRecords | undefined): string | undefined {
  if (activeRecords == null) {
    return undefined;
  }
  return JSONUtils.toJSONString(activeRecords, (key) => {
    return key.startsWith('__');
  });
}

export interface UpdateEntity {
  value: ActiveRecord;
  index: number;
}

export interface DeleteEntity {
  value: ActiveRecord;
  index: number;
}

/**
 * 修复可选项
 */
export interface RepairOptions {
  /**
   * 是否填充{@link ActiveRecord#__draftId}
   */
  fillDraftId?: boolean;

  /**
   * 填充{@link ActiveRecord#__parent}
   */
  parentDraftId?: string;
  hasChildren?: boolean;
}

export type PushActiveRecordsPredict = (currentRecords: ActiveRecord[], record: ActiveRecord) => boolean;

export type UpdateActiveRecordsByEntityPredict = (oldVal: ActiveRecord, newVal: ActiveRecord) => boolean;

export type DeleteActiveRecordsByEntityPredict = UpdateActiveRecordsByEntityPredict;

export type ReloadActiveRecordsFunction = (records: ActiveRecords | undefined) => void;

export type PushActiveRecordsFunction = (records: ActiveRecords, predict?: PushActiveRecordsPredict) => void;

export type UpdateActiveRecordsFunction = (records: UpdateEntity[]) => void;

export type UpdateActiveRecordsByEntityFunction = (
  records: ActiveRecords,
  predict?: UpdateActiveRecordsByEntityPredict
) => void;

export type DeleteActiveRecordsFunction = (recordIndexes: number[]) => void;

export type DeleteActiveRecordsByEntityFunction = (
  records: ActiveRecords,
  predict?: DeleteActiveRecordsByEntityPredict
) => void;

export type FlushActiveRecordsFunction = () => void;
