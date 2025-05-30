import { IModelField, ViewMode, ViewType } from '@kunlun/meta';
import { isFunction, isBoolean } from 'lodash-es';
import { RuntimeModelField } from '../../runtime-metadata';
import { RelationUpdateType, SubmitType } from '../../submit';
import { isRelation2MField, isRelationField } from '../helper';
import {
  GetRequestModelFieldsOptions,
  RequestModelField,
  RequestModelFieldFilterFunction,
  RuntimeContext
} from '../runtime-context';
import { seekFieldRuntimeContext } from './util';

export function getRequestFields(this: RuntimeContext): IModelField[] {
  // fixme @zbh 20221114 此方法返回值为了适配原有customQuery方法入参
  const fields: IModelField[] = [];
  this.model?.modelFields.forEach((field) => {
    fields.push(field as unknown as IModelField);
    if (isRelationField(field)) {
      const fieldRuntimeContext = seekFieldRuntimeContext(this, field);
      if (fieldRuntimeContext) {
        (field as unknown as IModelField).modelFields = getRequestFields.bind(fieldRuntimeContext)();
      } else {
        (field as unknown as IModelField).modelFields = (field.referencesModel
          ? field.referencesModel.modelFields
          : []) as unknown as IModelField[];
      }
    }
  });
  return fields;
}

export function getRequestModelFields(
  this: RuntimeContext,
  options?: GetRequestModelFieldsOptions
): RequestModelField[] {
  const fields = this.model?.modelFields;
  if (fields) {
    return generatorRequestModelFields(
      fields,
      options?.viewType || ViewType.Custom,
      options?.viewMode || ViewMode.Create,
      options?.submitType || SubmitType.default,
      options?.relationUpdateType || RelationUpdateType.default,
      options?.filter || false,
      this
    );
  }
  return [];
}

function generatorRequestModelFields(
  fields: RuntimeModelField[],
  viewType: ViewType,
  viewMode: ViewMode,
  submitType: SubmitType,
  relationUpdateType: RelationUpdateType,
  filter: boolean | RequestModelFieldFilterFunction,
  runtimeContext?: RuntimeContext
) {
  const targetFields: RequestModelField[] = [];
  fields.forEach((field) => {
    const target: RequestModelField = { field };
    if (isSkip(field, viewType, viewMode, submitType, relationUpdateType, filter)) {
      return;
    }
    if (isRelationField(field)) {
      const { referencesModel } = field;
      let isFillReferencesFields = false;
      if (runtimeContext) {
        const fieldRuntimeContext = seekFieldRuntimeContext(runtimeContext, field);
        if (fieldRuntimeContext) {
          target.referencesFields = getRequestModelFields.bind(fieldRuntimeContext)({
            viewType,
            viewMode,
            submitType,
            relationUpdateType
          });
          isFillReferencesFields = true;
        }
      }
      if (!isFillReferencesFields) {
        const referencesFields = referencesModel?.modelFields;
        if (referencesFields) {
          target.referencesFields = generatorRequestModelFields(
            referencesFields,
            viewType,
            viewMode,
            submitType,
            relationUpdateType,
            filter
          );
          isFillReferencesFields = true;
        }
      }
      if (!isFillReferencesFields) {
        console.error('referencesFields collection failure.', field);
        return;
      }
    }
    targetFields.push(target);
  });
  return targetFields;
}

function isSkip(
  field: RuntimeModelField,
  viewType: ViewType,
  viewMode: ViewMode,
  submitType: SubmitType,
  relationUpdateType: RelationUpdateType,
  filter: boolean | RequestModelFieldFilterFunction
): boolean {
  if (isBoolean(filter) && filter) {
    if (viewType === ViewType.Form && isRelation2MField(field)) {
      if (
        submitType === SubmitType.increment ||
        [RelationUpdateType.diff, RelationUpdateType.batch].includes(relationUpdateType)
      ) {
        return true;
      }
      const { submitType: fieldSubmitType, relationUpdateType: fieldRelationUpdateType } = field;
      if (
        (fieldSubmitType && fieldSubmitType === SubmitType.increment) ||
        (fieldRelationUpdateType &&
          [RelationUpdateType.diff, RelationUpdateType.batch].includes(fieldRelationUpdateType))
      ) {
        return true;
      }
    }
  }
  if (isFunction(filter)) {
    return !filter(field, viewType, viewMode, submitType, relationUpdateType);
  }
  return false;
}
