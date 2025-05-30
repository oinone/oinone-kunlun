import { RuntimeView, ViewCache } from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormWidget } from '../../form';
import { FormFieldWidget } from '../../../basic/field';
import { createRuntimeContextForWidget } from '../../../tags';
import { AbstractHomepageSettingFieldWidget } from './AbstractHomepageSettingFieldWidget';
import { BindingTypeEnum, HomepageConfigRule } from '../typing';
import { WidgetConstructor } from './AbstractHomepageSettingFieldWidget';

const HomepageSettingField_MODEL = 'base.HomePageConfigRules';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: ViewType.Form, widget: 'HomepageSettingFieldWidget' }))
export class HomepageSettingFieldWidget extends AbstractHomepageSettingFieldWidget<HomepageConfigRule[]> {
  protected loadNodeWidgets() {
    this.isReady = false;
    this.createNodeWidgets().then(() => {
      this.isReady = true;
    });
  }

  @Widget.Method()
  protected async updateNodeWidgetSort(index: number, futureIndex: number) {
    this.nodeWidgets.splice(futureIndex, 0, this.nodeWidgets.splice(index, 1)[0]);
    this.useHomepageSetting.sortTwoRules(
      this.runtimeHomepageConfigRules?.[index],
      this.runtimeHomepageConfigRules?.[futureIndex]
    );
  }

  @Widget.Method()
  protected async pushNewNodeWidget(initData?: Record<string, unknown>) {
    this.isReady = false;
    const nodes = this.runtimeHomepageConfigRules;
    const { viewType, nodeWidgets } = this;
    const view = await this.fetchView();
    if (!view) {
      console.error(`Invalid view UiDesignerTreeNodeMetadataForm`);
      return [];
    }
    let widget: { new (): FormWidget } = FormWidget;
    const runtimeContext = createRuntimeContextForWidget(view);
    const data = this.initData(initData);
    this.useHomepageSetting.setUnCommittedRule(data);
    const nodeFormWidget = this.createNodeWidget(runtimeContext, widget, data.id as string, data);
    nodes!.push(data);
    nodeWidgets.push(nodeFormWidget);
    this.isReady = true;
  }

  protected async createNodeWidgets() {
    this.disposeNodeWidgets();
    const view = await this.fetchView();
    if (!view) {
      console.error(`Invalid view UiDesignerTreeNodeMetadataForm`);
      return [];
    }
    if (!this.value) {
      this.activeRecords = [{}];
    }
    // 理论上 createNodeWidgets 的时候必有 runtimeHomepageConfigRules，因为在 AdvancedHomepageSettingWidget 中默认提供一个空规则
    this.activeRecords![0][this.itemName] = this.runtimeHomepageConfigRules;
    const nodes = this.runtimeHomepageConfigRules!;
    const length = nodes.length;
    let widget: WidgetConstructor = FormWidget;
    for (let i = 0; i < length; i++) {
      const runtimeContext = createRuntimeContextForWidget(view);
      const data = this.initData(nodes[i]);
      const nodeFormWidget = this.createNodeWidget(runtimeContext, widget, data.id as string, data);
      nodes[i] = data;
      this.nodeWidgets.push(nodeFormWidget);
    }

    this.reloadActiveRecords(this.activeRecords);
  }

  protected initData(data?: Record<string, unknown>): HomepageConfigRule {
    return {
      code: '',
      ruleName: '',
      expression: '',
      expressionJson: '',
      bindingType: BindingTypeEnum.MENU,
      enabled: true,
      ...(data || {})
    };
  }

  @Widget.Method()
  protected async disposeNodeWidget(index: number) {
    this.isReady = false;
    await this.$disposeNodeWidget(index);
    setTimeout(() => {
      this.isReady = true;
    });
  }

  protected async $disposeNodeWidget(index: number) {
    if (this.runtimeHomepageConfigRules) {
      const rule = this.runtimeHomepageConfigRules[index];
      if (rule) {
        this.useHomepageSetting.removeRule(rule);
      }
    }
    const nodeWidget = this.nodeWidgets[index];
    if (nodeWidget) {
      nodeWidget.dispose();
    }
    this.nodeWidgets.splice(index, 1);
    this.value!.splice(index, 1);
  }

  protected async fetchView(): Promise<RuntimeView | undefined> {
    return ViewCache.get(HomepageSettingField_MODEL, 'homePageRulesConfig');
  }
}
