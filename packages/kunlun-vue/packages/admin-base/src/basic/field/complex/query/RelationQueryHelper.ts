import {
  ActiveRecord,
  getStaticRelationField,
  isStaticRelationField,
  RelationUpdateType,
  RuntimeModel,
  RuntimeRelationField,
  SubmitType
} from '@kunlun/engine';
import { ViewMode } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { FetchUtil } from '../../../../util';

export class RelationQueryHelper {
  public static isNeedQuery(
    field: RuntimeRelationField,
    viewMode: ViewMode | undefined,
    submitType?: SubmitType,
    relationUpdateType?: RelationUpdateType
  ) {
    const { store, relationFields, referenceFields } = field;

    /**
     * 存储字段不需要发起queryPage查询，因为后端数据可以是JSON存储的
     */
    if (store || !viewMode || !relationFields.length || !referenceFields.length) {
      return false;
    }
    if (viewMode === ViewMode.Lookup) {
      return true;
    }
    return (
      viewMode === ViewMode.Editor &&
      (submitType === SubmitType.increment ||
        (relationUpdateType && [RelationUpdateType.diff, RelationUpdateType.batch].includes(relationUpdateType)))
    );
  }

  public static generatorO2MCondition(field: RuntimeRelationField, activeRecord: ActiveRecord): Condition | undefined {
    const { relationFields, referenceFields } = field;
    const queryBody: ActiveRecord = {};
    let counter = 0;
    for (let i = 0; i < relationFields.length; i++) {
      const relationField = relationFields[i];
      const referenceField = referenceFields[i];
      if (isStaticRelationField(referenceField)) {
        continue;
      }
      let targetValue: unknown;
      if (isStaticRelationField(relationField)) {
        targetValue = getStaticRelationField(relationField);
      } else {
        targetValue = activeRecord[relationField];
      }
      if (targetValue != null) {
        queryBody[referenceField] = targetValue;
        counter++;
      }
    }
    if (counter !== relationFields.length) {
      return undefined;
    }
    return FetchUtil.generatorSimpleCondition(queryBody);
  }

  public static generatorM2MQueryData(
    model: RuntimeModel,
    field: RuntimeRelationField,
    activeRecord: ActiveRecord
  ): ActiveRecord | undefined {
    const result = FetchUtil.generatorUniqueObject(model, activeRecord);
    const { relationFields } = field;
    let counter = 0;
    for (const relationField of relationFields) {
      let targetValue: unknown;
      if (isStaticRelationField(relationField)) {
        targetValue = getStaticRelationField(relationField);
      } else {
        targetValue = activeRecord[relationField];
      }
      if (targetValue != null) {
        if (result[relationField] == null) {
          result[relationField] = targetValue;
        }
        counter++;
      }
    }
    if (counter !== relationFields.length) {
      return undefined;
    }
    return result;
  }
}
