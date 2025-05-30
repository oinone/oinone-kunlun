import { ViewMode } from '@kunlun/meta';
import {
  RuntimeM2MField,
  RuntimeM2OField,
  RuntimeO2MField,
  RuntimeO2OField,
  RuntimeRelationField
} from '../../runtime-metadata';
import { ActiveRecord, ActiveRecords } from '../../typing';
import { SubmitCacheManager } from '../SubmitCacheManager';
import { RelationUpdateType, SubmitType } from '../typing';
import { booleanSubmit } from './boolean';
import { defaultSubmit } from './default';
import { M2MSubmit } from './m2m';
import { M2OSubmit } from './m2o';
import { O2MSubmit } from './o2m';
import { O2OSubmit } from './o2o';
import { SubmitFn, SubmitRelationValue, SubmitRelationValueFn, SubmitValue } from './typing';

export class SubmitHandler {
  public static DEFAULT = defaultSubmit;

  public static BOOLEAN = booleanSubmit;

  public static O2O = O2OSubmit;

  public static O2M = O2MSubmit;

  public static M2O = M2OSubmit;

  public static M2M = M2MSubmit;
}

export class SubmitRelationHandler {
  public static O2O: SubmitRelationValueFn<RuntimeO2OField, ActiveRecord> = async (
    field,
    itemName,
    submitValue,
    value,
    viewMode,
    submitCache,
    submitType,
    relationUpdateType
  ) => {
    return SubmitHandler.O2O(field, itemName, submitValue, value);
    // return SubmitRelationHandler.$submitRelationHandler<RuntimeO2OField, ActiveRecord>(
    //   SubmitHandler.O2O,
    //   field,
    //   itemName,
    //   submitValue,
    //   value,
    //   viewMode,
    //   submitCache,
    //   submitType,
    //   relationUpdateType
    // );
  };

  public static O2M: SubmitRelationValueFn<RuntimeO2MField, ActiveRecord[]> = async (
    field,
    itemName,
    submitValue,
    value,
    viewMode,
    submitCache,
    submitType,
    relationUpdateType
  ) => {
    return SubmitRelationHandler.$submitRelationHandler<RuntimeO2MField, ActiveRecord[]>(
      SubmitHandler.O2M,
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  };

  public static M2O: SubmitRelationValueFn<RuntimeM2OField, ActiveRecord> = async (
    field,
    itemName,
    submitValue,
    value,
    viewMode,
    submitCache,
    submitType,
    relationUpdateType
  ) => {
    return SubmitHandler.M2O(field, itemName, submitValue, value);
    // return SubmitRelationHandler.$submitRelationHandler<RuntimeM2OField, ActiveRecord>(
    //   SubmitHandler.M2O,
    //   field,
    //   itemName,
    //   activeRecord,
    //   value,
    //   viewMode,
    //   submitCache,
    //   submitType,
    //   relationUpdateType
    // );
  };

  public static M2M: SubmitRelationValueFn<RuntimeM2MField, ActiveRecord[]> = async (
    field,
    itemName,
    submitValue,
    value,
    viewMode,
    submitCache,
    submitType,
    relationUpdateType
  ) => {
    return SubmitRelationHandler.$submitRelationHandler<RuntimeM2MField, ActiveRecord[]>(
      SubmitHandler.M2M,
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  };

  private static async $submitRelationHandler<
    FIELD extends RuntimeRelationField = RuntimeRelationField,
    VALUE extends ActiveRecords = ActiveRecords
  >(
    submitFn: SubmitFn<FIELD, VALUE>,
    field: FIELD,
    itemName: string,
    submitValue: SubmitValue,
    value: VALUE | null | undefined,
    viewMode: ViewMode | undefined,
    submitCache: SubmitCacheManager | undefined,
    submitType: SubmitType,
    relationUpdateType: RelationUpdateType
  ) {
    let submitResult: Record<string, unknown> | undefined;
    switch (submitType) {
      case SubmitType.none:
        return undefined;
      case SubmitType.default:
      case SubmitType.relation:
      case SubmitType.increment:
        submitResult = await submitFn(field, itemName, submitValue, value);
        break;
      case SubmitType.all:
        submitResult = await SubmitHandler.DEFAULT(field, itemName, submitValue, value);
        break;
      default:
        throw new Error('Invalid submit type.');
    }
    if (
      viewMode === ViewMode.Editor &&
      submitCache &&
      (submitType === SubmitType.increment ||
        [RelationUpdateType.diff, RelationUpdateType.batch].includes(relationUpdateType))
    ) {
      return new SubmitRelationValue(relationUpdateType, field, submitResult).submitByCache(submitCache);
    }
    return submitResult;
  }
}

export { SubmitRelationValue, SubmitValue };
