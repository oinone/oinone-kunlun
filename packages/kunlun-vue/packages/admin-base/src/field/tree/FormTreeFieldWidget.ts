import {
  ActiveRecord,
  ActiveRecords,
  MemoryListSearchCache,
  RuntimeRelationField,
  UnsupportedOperationException
} from '@kunlun/engine';
import { BooleanHelper, CastHelper } from '@kunlun/shared';
import { OioTreeNode, SelectMode } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { FormComplexFieldProps } from '../../basic';
import { TreeNodeResponseBody, TreeService } from '../../service';
import { TreeData, TreeNodeMetadata } from '../../typing';
import { AbstractTreeFieldWidget, BackfillDataParameters } from '../tree-select';
import DefaultFieldTree from './DefaultFieldTree.vue';

export class FormTreeFieldWidget<
  Value = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends AbstractTreeFieldWidget<TreeData, Value, Field, Props> {
  @Widget.Reactive()
  protected selectedValue: OioTreeNode<TreeData> | OioTreeNode<TreeData>[] | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultFieldTree);
    return this;
  }

  @Widget.Reactive()
  protected get onlySelectedLeaf(): boolean {
    return this.getDsl().onlySelectedLeaf || false;
  }

  @Widget.Reactive()
  protected get checkable(): boolean {
    return true;
  }

  @Widget.Reactive()
  protected get checkStrictly(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().checkStrictly) || false;
  }

  @Widget.Method()
  protected async onSelected(node: OioTreeNode<TreeData>, selected: boolean): Promise<void> {
    if (this.selectMode === SelectMode.multiple) {
      await this.onChecked(node, selected);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Widget.Method()
  protected async onChecked(node: OioTreeNode<TreeData>, selected: boolean): Promise<void> {
    const currentSelectedValue = this.getCurrentSelectedValue();
    const targetSelectedValues = this.collectionSelectedNodes(node);
    this.onSelectedValueChange(currentSelectedValue, targetSelectedValues, selected);
  }

  @Widget.Method()
  protected nodeCheckedAll(node: OioTreeNode<TreeData>) {
    return BooleanHelper.toBoolean(this.getDsl().nodeCheckedAll) || false;
  }

  @Widget.Reactive()
  protected get nodeCheckedAllLabel(): string | undefined {
    return this.getDsl().nodeCheckedAllLabel;
  }

  @Widget.Reactive()
  protected get nodeUncheckedAllLabel(): string | undefined {
    return this.getDsl().nodeUncheckedAllLabel;
  }

  @Widget.Method()
  public onNodeCheckedAll(node: OioTreeNode<TreeData>, selected: boolean) {
    const currentSelectedValue = this.getCurrentSelectedValue();
    const targetSelectedValues = this.collectionSelectedAllNodes(node);
    this.onSelectedValueChange(currentSelectedValue, targetSelectedValues, selected);
  }

  protected getCurrentSelectedValue(): OioTreeNode<TreeData>[] {
    const { selectedValue } = this;
    let currentSelectedValue: OioTreeNode<TreeData>[];
    if (selectedValue) {
      if (Array.isArray(selectedValue)) {
        currentSelectedValue = selectedValue;
      } else {
        currentSelectedValue = [selectedValue];
      }
    } else {
      currentSelectedValue = [];
    }
    return currentSelectedValue;
  }

  protected collectionSelectedNodes(selectedNode: OioTreeNode<TreeData>): OioTreeNode<TreeData>[] {
    if (this.checkStrictly) {
      return this.collectionSelectedAllNodes(selectedNode);
    }
    const model = this.field.references;
    if (this.collectionSelectedNodesFilter(selectedNode, model)) {
      return [selectedNode];
    }
    return [];
  }

  protected collectionSelectedAllNodes(selectedNode: OioTreeNode<TreeData>): OioTreeNode<TreeData>[] {
    const model = this.field.references;
    const selectedNodes: OioTreeNode<TreeData>[] = [];
    this.$collectionSelectedNodes(selectedNodes, [selectedNode], (v) => this.collectionSelectedNodesFilter(v, model));
    return selectedNodes;
  }

  protected collectionSelectedNodesFilter(node: OioTreeNode<TreeData>, model: string) {
    return node.value.metadata.model === model && !node.disabled;
  }

  protected $collectionSelectedNodes(
    selectedNodes: OioTreeNode<TreeData>[],
    targetSelectedNodes: OioTreeNode<TreeData>[],
    filter: (value: OioTreeNode<TreeData>) => boolean
  ): void {
    for (const selectedNode of targetSelectedNodes) {
      if (filter(selectedNode)) {
        selectedNodes.push(selectedNode);
      }
      this.$collectionSelectedNodes(selectedNodes, selectedNode.children, filter);
    }
  }

  protected onSelectedValueChange(
    currentSelectedValue: OioTreeNode<TreeData>[],
    targetSelectedValues: OioTreeNode<TreeData>[],
    selected: boolean
  ) {
    let isChange = false;
    if (selected) {
      const currentSelectedValueCache = new MemoryListSearchCache(currentSelectedValue, (v) => v.key);
      for (const targetSelectedValue of targetSelectedValues) {
        if (currentSelectedValueCache.get(targetSelectedValue.key) == null) {
          currentSelectedValue = [...currentSelectedValue, targetSelectedValue];
          isChange = true;
        }
      }
    } else {
      const targetSelectedValueCache = new MemoryListSearchCache(targetSelectedValues, (v) => v.key);
      const ubs = currentSelectedValue.length;
      currentSelectedValue = currentSelectedValue.filter((v) => targetSelectedValueCache.get(v.key) == null);
      isChange = ubs !== currentSelectedValue.length;
    }
    if (isChange) {
      this.setSelectedValue(currentSelectedValue);
      this.$onSelectedChange(currentSelectedValue);
    }
  }

  protected generatorNewTreeNode(
    parent: OioTreeNode<TreeData>,
    key: string,
    title: string | undefined,
    metadata: TreeNodeMetadata,
    data: ActiveRecord
  ): OioTreeNode<TreeData> {
    const node = super.generatorNewTreeNode(parent, key, title, metadata, data);
    this.generatorTreeNodeAfterProperties(node);
    return node;
  }

  /**
   * 获取回填数据
   * @protected
   */
  protected async fetchBackfillData(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): Promise<TreeNodeResponseBody[] | undefined> {
    this.enableLoadData = false;
    return TreeService.fetchAll(metadataList, { expressionParameters: this.generatorExpressionParameters() });
  }

  protected backfillDataProcess({ selectedNodes }: BackfillDataParameters) {
    if (this.selectMode === SelectMode.multiple) {
      this.setSelectedValue(selectedNodes);
    } else {
      this.setSelectedValue(selectedNodes[0]);
    }
  }

  protected async backfillDataByValue(): Promise<boolean> {
    const res = await super.backfillDataByValue();
    if (!res) {
      const { treeDefinition: rootMetadata } = this;
      if (rootMetadata) {
        this.rootNode = this.generatorRootNode(rootMetadata);
        await this.loadAllData();
        return true;
      }
    }
    return res;
  }

  protected async clearBackfillDataProcess() {
    const { treeDefinition: rootMetadata } = this;
    if (rootMetadata) {
      this.rootNode = this.generatorRootNode(rootMetadata);
    } else {
      this.rootNode = undefined;
    }
    this.expandedKeys = [];
    this.setSelectedValue(undefined);
  }

  protected convertBackfillData(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[],
    list: TreeNodeResponseBody[],
    customCreateNodeCallback?: (node: OioTreeNode<TreeData>, value: TreeData | undefined) => void,
    customUpdateNodeCallback?: (node: OioTreeNode<TreeData>, value: TreeData) => void
  ): BackfillDataParameters | undefined {
    return super.convertBackfillData(
      currentValues,
      metadataList,
      list,
      customCreateNodeCallback ||
        ((node, value) => {
          if (value) {
            this.generatorTreeNodeAfterProperties(node);
          }
        }),
      customUpdateNodeCallback ||
        ((node) => {
          this.generatorTreeNodeAfterProperties(node);
        })
    );
  }

  protected generatorTreeNodeAfterProperties(node: OioTreeNode<TreeData>) {
    node.selectable = node.value.metadata.model === this.field.references;
  }

  protected setSelectedValue(selectedValue: OioTreeNode<TreeData> | OioTreeNode<TreeData>[] | undefined) {
    if (!selectedValue) {
      this.selectedValue = undefined;
      this.checkedKeys = undefined;
      return;
    }
    this.selectedValue = selectedValue;
    if (Array.isArray(selectedValue)) {
      this.checkedKeys = selectedValue.map((v) => v.key);
    } else {
      this.checkedKeys = [selectedValue.key];
    }
  }

  protected $onSelectedChange(selectedNodes: OioTreeNode<TreeData>[] | null | undefined) {
    if (selectedNodes === undefined) {
      return;
    }
    if (selectedNodes === null) {
      this.change(null);
      return;
    }
    const data: ActiveRecord[] = selectedNodes.map((v) => v.value.data!).filter((v) => !!v) || [];
    if (this.selectMode === SelectMode.multiple) {
      this.change(CastHelper.cast<Value>(data));
    } else {
      this.change(CastHelper.cast<Value>(data[0]));
    }
  }
}
