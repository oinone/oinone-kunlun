import { DEFAULT_SLOT_NAME } from '@kunlun/dsl';
import { FormLayout, OioColModel, OioFormInstance } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementObjectViewWidget, BaseElementObjectViewWidgetProps } from '../element';
import DefaultForm from './DefaultForm.vue';

/**
 * 基础Form组件，仅提供基本布局能力(Form, Detail, Search)视图通用
 */
export abstract class BaseFormWidget<
  Props extends BaseElementObjectViewWidgetProps = BaseElementObjectViewWidgetProps
> extends BaseElementObjectViewWidget<Props> {
  private formInstance: OioFormInstance | undefined;

  public getFormInstance(): OioFormInstance | undefined {
    return this.formInstance;
  }

  @Widget.Method()
  private setFormInstance(formInstance: OioFormInstance | undefined) {
    this.formInstance = formInstance;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected dataPath: string | undefined;

  @Widget.Reactive()
  protected labelCol: Partial<OioColModel> = {};

  @Widget.Reactive()
  protected wrapperCol: Partial<OioColModel> = {};

  @Widget.Reactive()
  protected get layout(): string {
    return (
      this.getDsl().layout?.toLowerCase?.() ||
      this.metadataRuntimeContext.viewTemplate?.direction?.toLowerCase?.() ||
      FormLayout[this.metadataRuntimeContext.viewTemplate?.layout?.toUpperCase?.()] ||
      FormLayout.vertical
    );
  }

  public initialize(props: Props) {
    if (!props.slotNames) {
      props.slotNames = [DEFAULT_SLOT_NAME];
    }
    super.initialize(props);
    this.setComponent(DefaultForm);
    return this;
  }
}
