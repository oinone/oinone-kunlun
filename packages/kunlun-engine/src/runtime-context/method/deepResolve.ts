import { DslDefinitionHelper, ViewDslDefinition } from '@kunlun/dsl';
import { RuntimeRelationField } from '../../runtime-metadata';
import { isRelationField } from '../helper';
import { resolveView } from '../resolve';
import { RuntimeContext } from '../runtime-context';

export default function deepResolve(this: RuntimeContext): void {
  this.model?.modelFields.forEach((field) => {
    if (isRelationField(field)) {
      const { referencesModel } = field;
      if (!referencesModel) {
        return;
      }
      const template = seekFieldChildTemplate(field);
      if (!template) {
        return;
      }
      const fieldRuntimeContext = this.createFieldRuntimeContext(field);
      resolveView(fieldRuntimeContext, {
        type: template.type,
        model: referencesModel.model,
        modelName: referencesModel.name,
        dsl: template
      });
      deepResolve.bind(fieldRuntimeContext)();
    }
  });
}

function seekFieldChildTemplate(field: RuntimeRelationField): ViewDslDefinition | undefined {
  // fixme @zbh 20221114 此处无法严格判断字段是否需要创建子上下文
  const widgets = field.template?.widgets || [];
  let target: ViewDslDefinition | undefined;
  for (const widget of widgets) {
    const type = widget.dslNodeType;
    if (!type) {
      continue;
    }
    if (DslDefinitionHelper.isTemplate(widget)) {
      target = widget.widgets?.find(DslDefinitionHelper.isView);
    } else if (DslDefinitionHelper.isView(widget)) {
      target = widget;
      break;
    }
    if (target) {
      break;
    }
  }
  return target;
}
