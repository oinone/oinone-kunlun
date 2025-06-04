import { ExpressionKeyword } from '@oinone/kunlun-expression';
import { RuntimeModelField, RuntimeRelatedField, RuntimeRelationField } from '../../runtime-metadata';
import { isRelatedField, isRelation2MField, isRelationField } from '../helper';
import { RuntimeContext } from '../runtime-context';
import { RuntimeContextManager } from '../runtime-context-manager';

function isEffectiveRelatedField(field: RuntimeModelField): field is RuntimeRelatedField {
  return isRelatedField(field) && !!field.related.length;
}

export function resolveRelated(runtimeContext: RuntimeContext) {
  runtimeContext.model.modelFields
    .filter(isEffectiveRelatedField)
    .forEach((field) => resolveRelatedCompute(runtimeContext, field));
}

export function resolveRelatedCompute(runtimeContext: RuntimeContext, field: RuntimeRelatedField) {
  const { related: relatedFields, compute } = field;
  if (compute != null) {
    return;
  }
  let finalCompute = ExpressionKeyword.activeRecord.toString();
  let isArrayResult = false;
  let lastedTargetField: RuntimeRelationField | undefined;
  for (let i = 0; i < relatedFields.length; i++) {
    const relatedField = relatedFields[i];
    let targetField: RuntimeModelField | undefined;
    if (lastedTargetField) {
      targetField = lastedTargetField.referencesModel?.modelFields?.find((v) => v.data === relatedField);
      if (!targetField) {
        const model = lastedTargetField.references;
        const targetRuntimeContext = findRuntimeContext(runtimeContext, model, lastedTargetField);
        if (!targetRuntimeContext) {
          return;
        }
        targetField = findModelField(targetRuntimeContext, relatedField);
      }
    } else {
      targetField = findModelField(runtimeContext, relatedField);
      if (!targetField || !isRelationField(targetField)) {
        return;
      }
      lastedTargetField = targetField;
    }
    if (!targetField) {
      return;
    }
    if (!!targetField.multi || isRelation2MField(targetField)) {
      isArrayResult = true;
    }
    if (i === 0) {
      finalCompute = `${finalCompute}.${relatedField}`;
    } else if (isArrayResult || isRelation2MField(lastedTargetField!)) {
      finalCompute = `LIST_FIELD_VALUES(${finalCompute}, '', '${relatedField}')`;
      isArrayResult = true;
    } else {
      finalCompute = `${finalCompute}.${relatedField}`;
    }
    if (!isRelationField(targetField)) {
      if (i === relatedFields.length - 1) {
        break;
      }
      return;
    }
    lastedTargetField = targetField;
  }
  field.compute = finalCompute;
}

function findRuntimeContext(runtimeContext: RuntimeContext, model: string, field: RuntimeRelationField) {
  let targetRuntimeContext: RuntimeContext | undefined;
  if (runtimeContext.model.model === model) {
    targetRuntimeContext = runtimeContext;
  }
  const others = RuntimeContextManager.getOthers(runtimeContext.handle);
  for (const other of others) {
    const otherRuntimeModel = other.model;
    if (otherRuntimeModel && model === otherRuntimeModel.model && other.field?.data === field.data) {
      targetRuntimeContext = other;
      break;
    }
  }
  return targetRuntimeContext;
}

function findModelField(runtimeContext: RuntimeContext, field: string): RuntimeModelField | undefined {
  const res = runtimeContext.getModelField(field);
  if (!res) {
    return;
  }
  const { modelField, isOther } = res;
  if (isOther) {
    return;
  }
  return modelField;
}
