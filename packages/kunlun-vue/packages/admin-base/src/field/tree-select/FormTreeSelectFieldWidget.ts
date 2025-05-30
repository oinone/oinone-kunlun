import { ActiveRecord, ActiveRecords, RuntimeRelationField } from '@kunlun/engine';
import { BooleanHelper } from '@kunlun/shared';
import {
  EmptyStyle,
  OioTreeNode,
  SelectMode,
  SimpleTreeSelected,
  TreeSelectNodeChangeEvent
} from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isBoolean, remove } from 'lodash-es';
import { FormComplexFieldProps } from '../../basic';
import { TreeNodeResponseBody } from '../../service';
import { TreeData, TreeNodeMetadata } from '../../typing';
import { AbstractTreeFieldWidget, BackfillDataParameters } from './AbstractTreeFieldWidget';
import DefaultTreeSelect from './DefaultTreeSelect.vue';

export class FormTreeSelectFieldWidget<
  Value = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends AbstractTreeFieldWidget<TreeData, Value, Field, Props> {
  @Widget.Reactive()
  protected selectedValue: SimpleTreeSelected | SimpleTreeSelected[] | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultTreeSelect);
    return this;
  }

  @Widget.Reactive()
  protected get onlySelectedLeaf(): boolean {
    return this.getDsl().onlySelectedLeaf || false;
  }

  /**
   * @see TreeSelectCheckedStrategy
   */
  @Widget.Reactive()
  protected get multipleCheckedStrategy(): string | undefined {
    return this.getDsl().multipleCheckedStrategy;
  }

  @Widget.Reactive()
  protected get treeCheckStrictly(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().treeCheckStrictly);
  }

  @Widget.Method()
  protected onSelectedChange(
    selectedValue: SimpleTreeSelected | SimpleTreeSelected[],
    event: TreeSelectNodeChangeEvent
  ) {
    if (!selectedValue || (Array.isArray(selectedValue) && !selectedValue.length)) {
      this.selectedValue = undefined;
      this.$onSelectedChange(null);
      this.internalOnSearch('');
      return;
    }
    const selectedNodes = this.getSelectedNodes(selectedValue);
    if (!selectedNodes) {
      return;
    }
    const res = this.validatorSelectedValue(selectedValue, selectedNodes);
    if (isBoolean(res)) {
      if (res) {
        this.selectedValue = selectedValue;
      }
    } else {
      this.selectedValue = res;
    }
    this.$onSelectedChange(selectedNodes);
  }

  protected getSelectedNodes(
    selectedValue: SimpleTreeSelected | SimpleTreeSelected[]
  ): OioTreeNode<TreeData>[] | undefined {
    const model = this.field.references;
    return this.collectionSelectedNodes(selectedValue).filter((v) => v.value.metadata.model === model);
  }

  protected collectionSelectedNodes(selectedValue: SimpleTreeSelected | SimpleTreeSelected[]): OioTreeNode<TreeData>[] {
    const { rootNode, searchRootNode } = this;
    if (!rootNode) {
      return [];
    }
    if (Array.isArray(selectedValue)) {
      selectedValue = [...selectedValue];
    } else {
      selectedValue = [selectedValue];
    }
    const selectedNodes: OioTreeNode<TreeData>[] = [];
    this.$collectionSelectedNodes(searchRootNode || rootNode, selectedValue, selectedNodes);
    return selectedNodes;
  }

  protected $collectionSelectedNodes(
    root: OioTreeNode<TreeData>,
    selectedValues: SimpleTreeSelected[],
    target: OioTreeNode<TreeData>[]
  ): void {
    for (const node of root.children) {
      const { key } = node;
      const [removedKey] = remove(selectedValues, (value) => value.value === key);
      if (removedKey) {
        target.push(node);
        if (!selectedValues.length) {
          return;
        }
      }
      if (node.children.length) {
        this.$collectionSelectedNodes(node, selectedValues, target);
      }
    }
  }

  protected validatorSelectedValue(
    selectedValue: SimpleTreeSelected | SimpleTreeSelected[],
    selectedNodes: OioTreeNode<TreeData>[]
  ): boolean | SimpleTreeSelected | SimpleTreeSelected[] | undefined {
    if (!selectedNodes.length) {
      if (this.selectMode === SelectMode.multiple) {
        return [];
      }
      return false;
    }
    const metadataList = this.getTreeMetadataList();
    const { onlySelectedLeaf } = this;
    const lastedMetadata = metadataList[metadataList.length - 1];
    if (this.selectMode === SelectMode.multiple) {
      const multipleSelectedValues = selectedValue as SimpleTreeSelected[];
      const finalSelectedValue: SimpleTreeSelected[] = [];
      for (const multipleSelectedValue of multipleSelectedValues) {
        const key = multipleSelectedValue.value;
        const selectedNode = selectedNodes.find((v) => v.key === key);
        if (selectedNode && lastedMetadata.key === selectedNode.value.metadata.key) {
          if (onlySelectedLeaf) {
            if (selectedNode.isLeaf) {
              finalSelectedValue.push(multipleSelectedValue);
            }
          } else {
            finalSelectedValue.push(multipleSelectedValue);
          }
        }
      }
      return finalSelectedValue;
    }
    const singleSelectedValue = selectedValue as SimpleTreeSelected;
    const key = singleSelectedValue.value;
    const selectedNode = selectedNodes[0];
    const isValidator =
      selectedNode && selectedNode.key === key && lastedMetadata.key === selectedNode.value.metadata.key;
    if (isValidator) {
      if (onlySelectedLeaf) {
        return selectedNode.isLeaf;
      }
    }
    return isValidator;
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

  protected backfillDataProcess({ selectedNodes }) {
    if (this.selectMode === SelectMode.multiple) {
      const selectedValues: SimpleTreeSelected[] = [];
      for (const selectedNode of selectedNodes) {
        const selectedValue = this.collectionSelectedValues(selectedNode);
        if (selectedValue) {
          selectedValues.push(selectedValue);
        }
      }
      this.selectedValue = selectedValues;
    } else {
      this.selectedValue = this.collectionSelectedValues(selectedNodes[0]);
    }
  }

  protected clearBackfillDataProcess() {
    const { treeDefinition: rootMetadata } = this;
    if (rootMetadata) {
      this.rootNode = this.generatorRootNode(rootMetadata);
    } else {
      this.rootNode = undefined;
    }
    this.expandedKeys = [];
    this.selectedValue = undefined;
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

  protected collectionSelectedValues(node: OioTreeNode<TreeData> | undefined): SimpleTreeSelected | undefined {
    if (!node) {
      return undefined;
    }
    return {
      label: node.title || EmptyStyle.hyphen,
      value: node.key,
      disabled: false
    };
  }
}
