import { DslDefinition, DslDefinitionHelper, DslSlotUtils, ViewDslDefinition } from '@oinone/kunlun-dsl';
import { ActiveRecords, createDefaultLayout, resolveTemplate } from '@oinone/kunlun-engine';
import { ViewMode, ViewType } from '@oinone/kunlun-meta';
import { Optional, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import type { RenderCellContext, RowContext } from '@oinone/kunlun-vue-ui';
import { DslRender, Widget } from '@oinone/kunlun-vue-widget';
import { cloneDeep } from 'lodash-es';
import { VNode } from 'vue';
import { BaseElementWidget, BaseTableColumnWidget } from '../../basic';

export interface LayoutColumnLoadedData {
  dataSource?: ActiveRecords | null;
  activeRecords?: ActiveRecords;
}

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: ['layout-column', 'LayoutColumn', 'layoutColumn']
  })
)
export class TableLayoutColumnWidget extends BaseTableColumnWidget {
  @Widget.Reactive()
  public get minWidth() {
    return Optional.ofNullable(this.getDsl().minWidth).orElseGet(() => this.computeDefaultMinWidth());
  }

  @Widget.Method()
  public className(context: RenderCellContext): string[] {
    return StringHelper.append(['table-column-layout'], super.className(context));
  }

  @Widget.Method()
  public headerClassName(context: RenderCellContext): string[] {
    return StringHelper.append(['table-header-column-layout'], super.headerClassName(context));
  }

  @Widget.Reactive()
  public get sortable(): boolean {
    return false;
  }

  @Widget.Reactive()
  public get enableGrouping(): boolean {
    return false;
  }

  @Widget.Reactive()
  public get editable(): boolean {
    return false;
  }

  public initialize(props) {
    super.initialize(props);
    const viewDslNode = this.template?.widgets?.find((v) => DslDefinitionHelper.isView(v)) as ViewDslDefinition;
    if (viewDslNode) {
      this.currentViewDsl = this.generatorViewDslDefinition(viewDslNode);
      resolveTemplate(this.rootRuntimeContext, this.currentViewDsl);
    }
    return this;
  }

  @Widget.Reactive()
  protected currentViewDsl: DslDefinition | undefined;

  public getViewDsl(context?: RowContext): DslDefinition | undefined {
    return this.currentViewDsl;
  }

  protected generatorViewDslDefinition(viewDslNode: ViewDslDefinition): DslDefinition {
    let { type: viewType } = viewDslNode;
    if (!viewType) {
      viewType = ViewType.Detail;
      viewDslNode.type = viewType;
    }
    if (viewType === ViewType.Form) {
      viewDslNode.mode = ViewMode.Editor;
    }
    const layout = this.generatorLayout(viewType);
    if (layout) {
      return DslSlotUtils.mergeTemplateToLayout(layout, viewDslNode);
    }
    return viewDslNode;
  }

  protected generatorLayout(viewType: ViewType): DslDefinition | undefined {
    return createDefaultLayout(viewType, true);
  }

  protected loadData(context: RowContext): LayoutColumnLoadedData {
    let data = context.data as ActiveRecords;
    if (!Array.isArray(data)) {
      data = [data];
    }
    data = cloneDeep(data);
    return {
      dataSource: data,
      activeRecords: data
    };
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const dslDefinition = this.getViewDsl(context);
    if (this.invisible || !dslDefinition) {
      return [];
    }
    const vnode = DslRender.render({
      ...dslDefinition,
      ...this.loadData(context),
      metadataHandle: this.metadataHandle,
      rootHandle: this.rootHandle,
      parentHandle: this.currentHandle,
      class: StringHelper.append(['table-expand-panel'], dslDefinition.class),
      model: this.model.model,
      modelName: this.model.name,
      module: this.model.module,
      moduleName: this.model.moduleName,
      inline: true
    });
    if (!vnode) {
      return [];
    }
    return [vnode];
  }
}
