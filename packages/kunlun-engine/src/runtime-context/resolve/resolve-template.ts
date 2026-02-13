import { type DslDefinition, DslDefinitionHelper, type ViewDslDefinition } from '@oinone/kunlun-dsl';
import { ModelFieldType } from '@oinone/kunlun-meta';
import type { RuntimeEnumerationOption, RuntimeModel } from '../../runtime-metadata';
import type { RuntimeContext } from '../runtime-context';
import { convert as actionConvert } from './action/resolve';
import { dslOptionToEnumerationOption } from './field/enumeration-field';
import { convert as fieldConvert } from './field/resolve';
import { selectorResolves } from './spi';
import { ResolveUtil } from './util';

export function resolveTemplate(runtimeContext: RuntimeContext, dsl: DslDefinition) {
  if (DslDefinitionHelper.isView(dsl)) {
    resolveMetadata(runtimeContext, dsl);
  } else {
    initDataDictionaryMap(runtimeContext);
  }
  traversal(runtimeContext, dsl);
}

function traversal(runtimeContext: RuntimeContext, dsl: DslDefinition) {
  const { dslNodeType } = dsl;
  selectorResolves({
    dslNodeType
  }).forEach((resolve) => resolve(runtimeContext, dsl));
  if (DslDefinitionHelper.isAction(dsl) || DslDefinitionHelper.isField(dsl)) {
    return;
  }
  dsl?.widgets?.forEach((c) => {
    if (DslDefinitionHelper.isView(c)) {
      return;
    }
    traversal(runtimeContext, c);
  });
}

function resolveModelMetadata(runtimeContext: RuntimeContext, dsl: ViewDslDefinition) {
  for (const model of dsl.metadata?.model || []) {
    const { model: modelModel, field: fields, action: actions } = model;
    let { virtualModels } = runtimeContext;
    if (!virtualModels) {
      virtualModels = {};
      runtimeContext.virtualModels = virtualModels;
    }
    let virtualModel = virtualModels[modelModel];
    if (!virtualModel) {
      virtualModel = {
        model: modelModel,
        fields: {},
        actions: {}
      };
      virtualModels[modelModel] = virtualModel;
    }
    const resolveRuntimeContext = {
      view: runtimeContext.view,
      model: {
        model: modelModel
      } as RuntimeModel
    } as RuntimeContext;
    for (const virtualField of fields) {
      if (virtualField.ttype === ModelFieldType.Related) {
        const related = (ResolveUtil.toArray(virtualField.related) || []).join('.');
        if (related) {
          virtualModel.fields[virtualField.data] = related;
        }
      } else {
        const field = fieldConvert(resolveRuntimeContext, virtualField);
        if (field) {
          field.modelDefinition = undefined;
          field.template = undefined;
          virtualModel.fields[field.data] = field;
        }
      }
    }
    for (const virtualAction of actions || []) {
      let action = actionConvert(resolveRuntimeContext, virtualAction);
      if (action) {
        action.modelDefinition = undefined;
        action = {
          ...action,
          ...action.template
        }; // 虚拟字段上有些东西需要保留,当前转换后template中一部分信息被移除掉了
        action.template = undefined;
        virtualModel.actions![action.name] = action;
      }
    }
  }
}

const globalDataDictionaryMap: Record<string, RuntimeEnumerationOption[]> = {};

function initDataDictionaryMap(runtimeContext: RuntimeContext): Record<string, RuntimeEnumerationOption[]> {
  let { dataDictionaryMap } = runtimeContext;
  if (!dataDictionaryMap) {
    dataDictionaryMap = {};
  }
  dataDictionaryMap = {
    ...globalDataDictionaryMap,
    ...dataDictionaryMap
  };
  runtimeContext.dataDictionaryMap = dataDictionaryMap;
  return dataDictionaryMap;
}

function resolveDataDictionaryMetadata(runtimeContext: RuntimeContext, dsl: ViewDslDefinition) {
  const dataDictionaryMap = initDataDictionaryMap(runtimeContext);
  for (const dataDictionary of dsl.metadata?.dictionary || []) {
    const { dictionary, options } = dataDictionary;
    const finalOptions: RuntimeEnumerationOption[] = [];
    for (const option of options) {
      const target = dslOptionToEnumerationOption(option);
      if (target == null) {
        continue;
      }
      finalOptions.push(target);
    }
    globalDataDictionaryMap[dictionary] = finalOptions;
    dataDictionaryMap[dictionary] = finalOptions;
  }
}

export function resolveMetadata(runtimeContext: RuntimeContext, dsl: ViewDslDefinition) {
  resolveModelMetadata(runtimeContext, dsl);
  resolveDataDictionaryMetadata(runtimeContext, dsl);
}
