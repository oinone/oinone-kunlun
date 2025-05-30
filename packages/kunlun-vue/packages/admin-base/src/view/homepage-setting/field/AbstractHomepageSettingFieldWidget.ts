import { ActiveRecords, RuntimeContext, SubmitValue, RuntimeView } from '@kunlun/engine';
import { CallChaining } from '@kunlun/shared';
import { Widget } from '@kunlun/vue-widget';
import { Subscription } from '@kunlun/state';
import { FormFieldWidget } from '../../../basic/field';
import { FormWidget } from '../../form';
import { HomepageConfigRule } from '../typing';
import { RenderWidgetsBehavior, ValidateWidgetsBehavior } from '../service/behaviors';
import HomepageSettingField from './HomepageSettingField.vue';

export type WidgetConstructor = { new (): FormWidget };

export abstract class AbstractHomepageSettingFieldWidget<T> extends FormFieldWidget<T> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(HomepageSettingField);
    return this;
  }

  protected renderWidgetsSub: Subscription | null = null;

  protected validateWidgetsSub: Subscription | null = null;

  @Widget.Reactive()
  protected isReady = false;

  @Widget.Inject('runtimeHomepageConfigRules')
  @Widget.Reactive()
  protected runtimeHomepageConfigRules: T | undefined = undefined;

  @Widget.Inject('useHomepageSetting')
  protected useHomepageSetting;

  protected nodeWidgets: FormWidget[] = [];

  protected createNodeWidget(
    runtimeContext: RuntimeContext,
    widgetConstructor: WidgetConstructor,
    slotName: string,
    data: ActiveRecords
  ) {
    const runtimeContextHandle = runtimeContext.handle;
    return this.createWidget(widgetConstructor, slotName, {
      metadataHandle: runtimeContextHandle,
      rootHandle: runtimeContextHandle,
      dataSource: data,
      activeRecords: data,
      template: runtimeContext.viewTemplate,
      inline: true,
      // 此处需要隔离上下文
      mountedCallChaining: new CallChaining(),
      refreshCallChaining: new CallChaining(),
      submitCallChaining: new CallChaining<SubmitValue>(),
      validatorCallChaining: new CallChaining<boolean>()
    });
  }

  protected disposeNodeWidgets() {
    this.nodeWidgets.forEach((nodeWidget) => {
      nodeWidget.dispose();
    });
    this.nodeWidgets = [];
  }

  protected async validateFormWidgets() {
    const res = await Promise.all(this.nodeWidgets.map((nodeWidget) => nodeWidget.validator())).then((res) =>
      res.every((r) => r)
    );
    if (res) {
      ValidateWidgetsBehavior.next('validateSuccess');
    } else {
      ValidateWidgetsBehavior.next('validateError');
    }
  }

  protected abstract initData(data: Record<string, unknown>): HomepageConfigRule;

  protected abstract fetchView(): Promise<RuntimeView | undefined>;

  protected abstract loadNodeWidgets();

  protected abstract pushNewNodeWidget(data: Record<string, unknown>);

  protected abstract createNodeWidgets();

  protected abstract disposeNodeWidget(index: number);

  protected beforeMount() {
    super.beforeMount();

    this.renderWidgetsSub = RenderWidgetsBehavior.subscribe((value?: { emitName: string; arg?: unknown }) => {
      if (value?.emitName === 'reloadHomepageConfig') {
        this.loadNodeWidgets();
      }
      if (value?.emitName === 'addAdvancedHomepageRule') {
        this.pushNewNodeWidget(value.arg as Record<string, unknown>);
      }
    });

    this.validateWidgetsSub = ValidateWidgetsBehavior.subscribe((value: string) => {
      if (value === 'validator') {
        this.validateFormWidgets();
      }
    });
  }

  protected unmounted() {
    this.renderWidgetsSub?.unsubscribe();
    this.validateWidgetsSub?.unsubscribe();
  }
}
