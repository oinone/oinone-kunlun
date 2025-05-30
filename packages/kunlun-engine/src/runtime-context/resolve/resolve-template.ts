import { DslDefinition, DslDefinitionHelper, ViewDslDefinition } from '@kunlun/dsl';
import { ModelFieldType } from '@kunlun/meta';
import { RuntimeModel } from '../../runtime-metadata';
import { RuntimeContext } from '../runtime-context';
import { convert as fieldConvert } from './field/resolve';
import { selectorResolves } from './spi';
import { ResolveUtil } from './util';

export function resolveTemplate(runtimeContext: RuntimeContext, dsl: DslDefinition) {
  if (DslDefinitionHelper.isView(dsl)) {
    resolveMetadata(runtimeContext, dsl);
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

function resolveMetadata(runtimeContext: RuntimeContext, dsl: ViewDslDefinition) {
  for (const model of dsl.metadata?.model || []) {
    const { model: modelModel, field: fields } = model;
    let { virtualModels } = runtimeContext;
    if (!virtualModels) {
      virtualModels = {};
      runtimeContext.virtualModels = virtualModels;
    }
    let virtualModel = virtualModels[modelModel];
    if (!virtualModel) {
      virtualModel = {
        model: modelModel,
        fields: {}
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
  }
}
