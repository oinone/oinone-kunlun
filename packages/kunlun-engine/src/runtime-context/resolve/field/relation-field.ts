import { ActionDslDefinition, DslDefinition, DslDefinitionHelper, FieldDslDefinition } from '@kunlun/dsl';
import { ModelFieldType, ModelType } from '@kunlun/meta';
import { uniqueKeyGenerator } from '@kunlun/shared';
import {
  RuntimeM2MField,
  RuntimeM2OField,
  RuntimeModel,
  RuntimeModelField,
  RuntimeO2MField,
  RuntimeO2OField,
  RuntimeRelationField
} from '../../../runtime-metadata';
import { isRelationField } from '../../helper';
import { RuntimeContext } from '../../runtime-context';
import { RuntimeContextManager } from '../../runtime-context-manager';
import { convert as convertAction, getAndRepairName as getAndRepairActionName } from '../action/resolve';
import { ResolveUtil } from '../util';
import { convert as convertField, getAndRepairName as getAndRepairFieldName } from './resolve';

interface BaseDslReferenceInfo {
  references: string;
  referencesType: ModelType;
  referencesPks: string[];
  referencesUniques: string[];
  referencesModelName: string;
  referencesModuleName: string;
  referencesLabel: string;
  referencesLabelFields: string[];
  widgets?: DslReferenceModelField[];
}

interface DslReferenceModel extends BaseDslReferenceInfo {
  optionLabel: string;
  optionFields: string[];
  widgets: DslReferenceModelField[];
}

interface DslReferenceModelField {
  ttype: ModelFieldType;
  data: string;
  name: string;
  options?: [DslReferenceModel];
}

type DslReferenceRelationModelField = DslReferenceModelField & BaseDslReferenceInfo;

function isDslReferenceRelationModelField(field: DslReferenceModelField): field is DslReferenceRelationModelField {
  return isRelationField(field as RuntimeModelField);
}

export function convertRelationField(
  runtimeContext: RuntimeContext,
  dsl: FieldDslDefinition,
  field: RuntimeRelationField
) {
  field.relationStore = dsl.relationStore;
  field.filter = dsl.filter;
  field.domain = dsl.domain;
  field.relationUpdateType = dsl.relationUpdateType?.toLowerCase?.();
  const sortFields = ResolveUtil.toArray(dsl.sortFields) || [];
  if (sortFields.length) {
    field.sortFields = sortFields;
  }

  const dslReferences: DslReferenceModel = dsl.options?.[0];
  const references = dsl.references as string;
  if (!references) {
    throw new Error('Invalid relation field. references is required.');
  }

  if (dslReferences) {
    const referencesModel: RuntimeModel = {
      model: references,
      type: dslReferences.referencesType,
      name: dslReferences.referencesModelName,
      moduleName: dslReferences.referencesModuleName,
      pks: ResolveUtil.toArray(dslReferences.referencesPks),
      uniques: ResolveUtil.toArray(dslReferences.referencesUniques, ';')
        ?.map((v) => ResolveUtil.toArray(v)!)
        .filter((v) => !!v),
      label: dslReferences.optionLabel || dslReferences.referencesLabel,
      labelFields: ResolveUtil.toArray(dslReferences.optionFields || dslReferences.referencesLabelFields),
      modelFields: [],
      modelActions: []
    };
    field.referencesModel = referencesModel;

    const resolveContext = RuntimeContextManager.createOrReplace(uniqueKeyGenerator());
    resolveContext.model = referencesModel;

    resolveExtendFieldAndAction(resolveContext, dsl);
    resolveReferenceModelField(referencesModel, dslReferences.widgets);

    RuntimeContextManager.delete(resolveContext.handle);
  }
  field.references = references;
  field.relationFields = ResolveUtil.toArray(dsl.relationFields) || [];
  field.referenceFields = ResolveUtil.toArray(dsl.referenceFields) || [];
}

export function convertO2OField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeO2OField) {
  if (!field.store && field.relationStore) {
    validator(field, field.relationFields, field.referenceFields);
  }
}

export function convertM2OField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeM2OField) {
  if (!field.store && field.relationStore) {
    validator(field, field.relationFields, field.referenceFields);
  }
}

export function convertO2MField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeO2MField) {
  field.limit = ResolveUtil.toNumberOrStringNullable(dsl.limit);
  if (!field.store && field.relationStore) {
    validator(field, field.relationFields, field.referenceFields);
  }
}

export function convertM2MField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeM2MField) {
  field.through = dsl.through;
  field.limit = ResolveUtil.toNumberOrStringNullable(dsl.limit);

  field.throughRelationFields = ResolveUtil.toArray(dsl.throughRelationFields) || [];
  field.throughReferenceFields = ResolveUtil.toArray(dsl.throughReferenceFields) || [];
  if (!field.store && field.relationStore) {
    validator(field, field.relationFields, field.throughRelationFields);
    validator(field, field.referenceFields, field.throughReferenceFields);
  }
}

function resolveReferenceModelField(model: RuntimeModel, fields: DslReferenceModelField[] | undefined): void {
  const { modelFields } = model;
  fields?.forEach((field) => {
    if (modelFields.some((v) => v.data === field.data)) {
      return;
    }
    if (isDslReferenceRelationModelField(field)) {
      const relationField = { ...field };
      const dslReferences: DslReferenceModel | undefined = field.options?.[0];
      if (dslReferences) {
        const referencesModel: RuntimeModel = {
          model: dslReferences.references,
          type: dslReferences.referencesType,
          name: dslReferences.referencesModelName,
          moduleName: dslReferences.referencesModuleName,
          pks: ResolveUtil.toArray(dslReferences.referencesPks),
          label: dslReferences.optionLabel || dslReferences.referencesLabel,
          labelFields: ResolveUtil.toArray(dslReferences.referencesLabelFields),
          modelFields: [],
          modelActions: []
        };
        (relationField as unknown as RuntimeRelationField).referencesModel = referencesModel;
        resolveReferenceModelField(referencesModel, dslReferences.widgets);
      }
      delete relationField.options;
      modelFields.push(relationField as unknown as RuntimeModelField);
      return;
    }
    modelFields.push(field as RuntimeModelField);
  });
}

function resolveExtendFieldAndAction(runtimeContext: RuntimeContext, dsl: DslDefinition | undefined) {
  dsl?.widgets?.forEach((c) => {
    if (DslDefinitionHelper.isView(c)) {
      return;
    }
    if (DslDefinitionHelper.isField(c)) {
      appendField(runtimeContext, c);
    } else if (DslDefinitionHelper.isAction(c)) {
      appendAction(runtimeContext, c);
    } else if (DslDefinitionHelper.isTemplate(c)) {
      resolveExtendFieldAndAction(runtimeContext, c);
    }
  });
}

function appendField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition) {
  const fields = runtimeContext.model.modelFields;
  const { data } = getAndRepairFieldName(dsl);
  if (fields.some((v) => v.data === data)) {
    return;
  }
  const field = convertField(runtimeContext, dsl);
  if (field) {
    field.modelDefinition = undefined;
    fields.push(field);
  }
}

function appendAction(runtimeContext: RuntimeContext, dsl: ActionDslDefinition) {
  const actions = runtimeContext.model.modelActions;
  const name = getAndRepairActionName(dsl);
  if (actions.some((v) => v.name === name)) {
    return;
  }
  const action = convertAction(runtimeContext, dsl);
  if (action) {
    action.modelDefinition = undefined;
    actions.push(action);
  }
}

function validator(field: RuntimeRelationField, relationFields: string[], referenceFields: string[]) {
  const relLength = relationFields.length;
  const refLength = referenceFields.length;
  if (!relLength || !refLength || relLength !== refLength) {
    console.error('Invalid relationFields and referenceFields', field);
    throw new Error('Invalid relationFields and referenceFields');
  }
}
