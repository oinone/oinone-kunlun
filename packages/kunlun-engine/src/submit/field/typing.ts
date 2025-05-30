import { ViewMode } from '@kunlun/meta';
import { ReturnPromise } from '@kunlun/shared';
import { RuntimeModelField, RuntimeRelationField } from '../../runtime-metadata';
import { ActiveRecord, ActiveRecords } from '../../typing';
import { SubmitCacheManager } from '../SubmitCacheManager';
import { RelationUpdateType, SubmitType } from '../typing';

export type SubmitFn<FIELD extends RuntimeModelField = RuntimeModelField, VALUE = unknown> = (
  field: FIELD,
  itemName: string,
  submitValue: SubmitValue,
  value: VALUE | null | undefined,
  defaultSubmitFn?: () => ReturnPromise<Record<string, unknown> | undefined>
) => ReturnPromise<Record<string, unknown> | undefined>;

export type SubmitRelationValueFn<
  FIELD extends RuntimeRelationField = RuntimeRelationField,
  VALUE extends ActiveRecords = ActiveRecords
> = (
  field: FIELD,
  itemName: string,
  submitValue: SubmitValue,
  value: VALUE | null | undefined,
  viewMode: ViewMode | undefined,
  submitCache: SubmitCacheManager | undefined,
  submitType: SubmitType,
  relationUpdateType: RelationUpdateType
) => Promise<Record<string, unknown> | SubmitRelationValue | undefined>;

export class SubmitRelationValue {
  private readonly relationUpdateType: RelationUpdateType = RelationUpdateType.default;

  private readonly field: RuntimeRelationField;

  private value: Record<string, unknown> | undefined;

  private createRecords: ActiveRecord[] = [];

  private updateRecords: ActiveRecord[] = [];

  private deleteRecords: ActiveRecord[] = [];

  public constructor(
    relationUpdateType: RelationUpdateType,
    field: RuntimeRelationField,
    value: Record<string, unknown> | undefined
  ) {
    this.relationUpdateType = relationUpdateType;
    this.field = field;
    this.value = value;
  }

  public getRelationUpdateType() {
    return this.relationUpdateType;
  }

  public getField() {
    return this.field;
  }

  public getValue() {
    return this.value;
  }

  public getCreateRecords() {
    return this.createRecords;
  }

  public getUpdateRecords() {
    return this.updateRecords;
  }

  public getDeleteRecords() {
    return this.deleteRecords;
  }

  public submitByCache(cache: SubmitCacheManager): SubmitRelationValue {
    const { createRecords, updateRecords, deleteRecords } = cache.getOperatorResult();
    this.createRecords = createRecords;
    this.updateRecords = updateRecords;
    this.deleteRecords = deleteRecords;
    return this;
  }
}

export class SubmitValue {
  public records?: ActiveRecords;

  public relationRecords: SubmitRelationValue[] = [];

  public constructor(records: ActiveRecords | undefined, relationRecords?: SubmitRelationValue[]) {
    this.records = records;
    this.relationRecords = relationRecords || [];
  }
}
