import { DslDefinition } from '@oinone/kunlun-dsl';
import { RuntimeM2MField, RuntimeO2MField, RuntimeView } from '@oinone/kunlun-engine';
import { FormComplexFieldProps } from '../FormComplexFieldWidget';
import { FormSubviewListFieldWidget } from './FormSubviewListFieldWidget';

export class AsyncFormSubviewListFieldWidget<
  Field extends RuntimeO2MField | RuntimeM2MField = RuntimeO2MField | RuntimeM2MField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends FormSubviewListFieldWidget<Field, Props> {
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
