import { DslDefinition, DslDefinitionHelper, FieldDslDefinition } from '@oinone/kunlun-dsl';
import { isRelationTtype, ModelFieldSerializeType, ModelFieldType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { generatorModelName, RuntimeModelField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';
import { resolveAction } from '../action';
import { ResolveUtil } from '../util';
import { selectorConverters } from './spi';

export function resolveField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition) {
  const fields = runtimeContext.model.modelFields;
  const modelField = convert(runtimeContext, dsl);
  if (modelField) {
    const metadataIndex = fields.length;
    dsl.__metadata_index = metadataIndex;
    modelField.__index = metadataIndex;

    fields.push(modelField);

    if (!isRelationTtype(modelField.ttype)) {
      deepResolveField(runtimeContext, dsl);
    }
  }

  return modelField;
}

function deepResolveField(runtimeContext: RuntimeContext, dsl: DslDefinition) {
  dsl?.widgets?.forEach((c) => {
    if (DslDefinitionHelper.isView(c)) {
      return;
    }

    if (DslDefinitionHelper.isTemplate(c)) {
      deepResolveField(runtimeContext, c);
      return;
    }

    if (DslDefinitionHelper.isAction(c)) {
      resolveAction(runtimeContext, c);
      return;
    }

    if (DslDefinitionHelper.isField(c)) {
      /**
       * 平级的字段允许重复，递归里面的字段不允许重复
       */
      const fields = runtimeContext.model.modelFields;
      const { data } = getAndRepairName(c);
      const match = fields.find((f) => f.data === data);
      if (!match) {
        resolveField(runtimeContext, c);
      }
    }
  });
}

export function convert(runtimeContext: RuntimeContext, dsl: FieldDslDefinition): RuntimeModelField | undefined {
  const model = ResolveUtil.getAndRepairModel(runtimeContext, dsl, { verifyModelConsistency: true });
  if (!model) {
    console.error('field model is required.', runtimeContext, dsl);
    return undefined;
  }
  return convertRuntimeModelField(runtimeContext, model, dsl, (field) => {
    selectorConverters({
      viewType: runtimeContext.view?.type,
      ttype: field.ttype,
      multi: field.multi
    }).forEach((resolve) => resolve(runtimeContext, dsl, field));
  });
}

export function convertRuntimeModelField(
  runtimeContext: RuntimeContext,
  model: string,
  dsl: FieldDslDefinition,
  consumer?: (field: RuntimeModelField) => void
): RuntimeModelField | undefined {
  const { data, name } = getAndRepairName(dsl);
  if (!data || !name) {
    console.error('field data is required.', dsl);
    return undefined;
  }
  const field: RuntimeModelField = {
    id: dsl.id,
    template: dsl,
    model,
    modelName: dsl.modelName || generatorModelName(model),
    data,
    name,
    ttype: dsl.ttype?.toUpperCase() as ModelFieldType,
    multi: dsl.multi || false,
    store: dsl.store,
    sortable: dsl.sortable,
    storeSerialize: dsl.storeSerialize?.toUpperCase?.() as ModelFieldSerializeType,
    displayName: dsl.displayName,
    label: dsl.label,
    readonly: dsl.readonly,
    invisible: dsl.invisible,
    disabled: dsl.disabled,
    compute: dsl.compute,
    submitType: dsl.submitType?.toLowerCase?.(),
    translate: BooleanHelper.toBoolean(dsl.translate),
    isVirtual: BooleanHelper.toBoolean(dsl.isVirtual)
  };
  consumer?.(field);
  ResolveUtil.clearUndefined(field);
  field.modelDefinition = runtimeContext.model;
  return field;
}

export function getAndRepairName(dsl: FieldDslDefinition): { data: string | undefined; name: string | undefined } {
  dsl.name = dsl.name || dsl.data;
  dsl.data = dsl.data || dsl.name;
  const { data, name } = dsl;
  return {
    data,
    name
  };
}
