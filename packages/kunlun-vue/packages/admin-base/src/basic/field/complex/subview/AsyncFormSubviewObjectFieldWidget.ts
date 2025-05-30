import { DslDefinition } from '@kunlun/dsl';
import { RuntimeM2OField, RuntimeO2OField, RuntimeView } from '@kunlun/engine';
import { FormComplexFieldProps } from '../FormComplexFieldWidget';
import { FormSubviewObjectFieldWidget } from './FormSubviewObjectFieldWidget';

export class AsyncFormSubviewObjectFieldWidget<
  Field extends RuntimeO2OField | RuntimeM2OField = RuntimeO2OField | RuntimeM2OField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends FormSubviewObjectFieldWidget<Field, Props> {
  protected async initSubview(props: Props): Promise<void> {
    const { currentViewDsl, metadataSubviewWidget } = this;
    if (!metadataSubviewWidget) {
      return;
    }
    let viewDsl = currentViewDsl;
    if (!viewDsl) {
      viewDsl = await this.getViewDsl(props);
      this.currentViewDsl = viewDsl;
    }
    const runtimeSubview = await this.generatorRuntimeSubview(props);
    this.runtimeSubviewContext = this.initRuntimeContext(metadataSubviewWidget, runtimeSubview);
    this.initSubviewAfterProperties(props);
  }

  protected async generatorRuntimeSubview(props: Props): Promise<RuntimeView> {
    return {
      type: this.subviewType,
      model: this.subviewModel,
      modelName: this.subviewModelName || '',
      module: this.subviewModule,
      moduleName: this.subviewModuleName,
      layout: await this.getViewLayout(props),
      dsl: this.currentViewDsl,
      template: await this.getViewTemplate(props)
    };
  }

  protected async getViewLayout(props: Props): Promise<DslDefinition | undefined> {
    return undefined;
  }

  protected async getViewDsl(props: Props): Promise<DslDefinition | undefined> {
    const { template } = props;
    return template && this.findViewDslNode(template);
  }

  protected async getViewTemplate(props: Props): Promise<DslDefinition | undefined> {
    return undefined;
  }
}
