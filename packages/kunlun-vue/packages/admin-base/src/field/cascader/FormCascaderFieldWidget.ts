import { ActiveRecord, ActiveRecords, RuntimeRelationField } from '@kunlun/engine';
import { BooleanHelper, ObjectUtils } from '@kunlun/shared';
import { CascaderCheckedStrategy, CascaderItem, OioTreeNode, SelectMode } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isBoolean } from 'lodash-es';
import { FormComplexFieldProps } from '../../basic';
import { TreeNodeResponseBody, TreeService } from '../../service';
import { TreeData, TreeNodeMetadata } from '../../typing';
import { AbstractTreeFieldWidget } from '../tree-select';
import DefaultCascader from './DefaultCascader.vue';

type CascaderItemType = CascaderItem<OioTreeNode<TreeData>>;

export class FormCascaderFieldWidget<
  Value = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends AbstractTreeFieldWidget<TreeData, Value, Field, Props> {
  @Widget.Reactive()
  protected selectedValue: string[] | string[][] | undefined;

  @Widget.Reactive()
  protected selectedLabels: string[] | string[][] | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCascader);
    return this;
  }

  @Widget.Reactive()
  protected get changeOnSelect(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().changeOnSelect) || false;
  }

  @Widget.Reactive()
  protected get labelsSeparator(): string | undefined {
    return this.getDsl().labelsSeparator;
  }

  @Widget.Reactive()
  protected get showPath(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().showPath) || false;
  }

  /**
   * @see CascaderCheckedStrategy
   */
  @Widget.Reactive()
  protected get multipleCheckedStrategy(): string | undefined {
    return this.getDsl().multipleCheckedStrategy;
  }

  @Widget.Method()
  protected onSelectedChange(
    selectedValue: string[] | string[][],
    selectedOptions: CascaderItemType[] | CascaderItemType[][]
  ) {
    if (!selectedValue?.length && !selectedOptions?.length) {
      this.selectedValue = undefined;
      this.selectedLabels = undefined;
      this.$onSelectedChange(null);
      this.internalOnSearch('');
      return;
    }
    const selectedNodes = this.getSelectedNodes(selectedValue, selectedOptions);
    if (!selectedNodes) {
      return;
    }
    const res = this.validatorSelectedValue(selectedValue, selectedNodes);
    if (isBoolean(res)) {
      if (res) {
        this.selectedValue = selectedValue;
      } else {
        return;
      }
    } else {
      this.selectedValue = res;
    }
    this.$onSelectedChange(selectedNodes);
  }

  protected getSelectedNodes(
    selectedValue: string[] | string[][],
    selectedOptions: CascaderItemType[] | CascaderItemType[][]
  ): OioTreeNode<TreeData>[] | undefined {
    const { changeOnSelect, multipleCheckedStrategy } = this;
    const selectedNodes: OioTreeNode<TreeData>[] = [];
    if (this.selectMode === SelectMode.multiple) {
      const multipleSelectOptions = selectedOptions as CascaderItemType[][];
      const repeatKeySet = new Set<string>();
      if (multipleCheckedStrategy === CascaderCheckedStrategy.SHOW_ALL) {
        const pushSelectedNodes = (node: OioTreeNode<TreeData>) => {
          if (!ObjectUtils.isRepeat(repeatKeySet, node.key)) {
            selectedNodes.push(node);
            node.children?.forEach(pushSelectedNodes);
          }
        };
        for (const multipleSelectOption of multipleSelectOptions) {
          const submitIndex = multipleSelectOption.length - 1;
          const data: OioTreeNode<TreeData> | undefined = multipleSelectOption[submitIndex]?.data;
          if (data && !ObjectUtils.isRepeat(repeatKeySet, data.key)) {
            selectedNodes.push(data);
            data.children?.forEach(pushSelectedNodes);
          }
        }
      } else if (multipleCheckedStrategy === CascaderCheckedStrategy.SHOW_PARENT) {
        for (const multipleSelectOption of multipleSelectOptions) {
          const submitIndex = multipleSelectOption.length - 1;
          const data: OioTreeNode<TreeData> | undefined = multipleSelectOption[submitIndex]?.data;
          if (data && !ObjectUtils.isRepeat(repeatKeySet, data.key)) {
            selectedNodes.push(data);
          }
        }
      } else {
        for (const multipleSelectOption of multipleSelectOptions) {
          const submitIndex = multipleSelectOption.length - 1;
          let data: OioTreeNode<TreeData> | undefined = multipleSelectOption[submitIndex]?.data;
          if (!changeOnSelect && data?.children.length) {
            data = undefined;
          }
          if (data && !ObjectUtils.isRepeat(repeatKeySet, data.key)) {
            selectedNodes.push(data);
          }
        }
      }
    } else {
      const singleSelectOptions = selectedOptions as CascaderItemType[];
      const submitIndex = singleSelectOptions.length - 1;
      let data: OioTreeNode<TreeData> | undefined = singleSelectOptions[submitIndex]?.data;
      if (!changeOnSelect && data?.children.length) {
        data = undefined;
      }
      if (data) {
        selectedNodes.push(data);
      }
    }
    return selectedNodes;
  }

  protected validatorSelectedValue(
    selectedValue: string[] | string[][],
    selectedNodes: OioTreeNode<TreeData>[]
  ): boolean | string[] | string[][] {
    if (!selectedNodes.length) {
      return [];
    }
    const { selectMode, changeOnSelect, multipleCheckedStrategy } = this;
    const metadataList = this.getTreeMetadataList();
    const lastedMetadata = metadataList[metadataList.length - 1];
    if (selectMode === SelectMode.multiple) {
      const multipleSelectedValues = selectedValue as string[][];
      const finalSelectedValue: string[][] = [];
      const finalSelectedLabels: string[][] = [];
      if (multipleCheckedStrategy === CascaderCheckedStrategy.SHOW_ALL) {
        const pushSelectedValues = (node: OioTreeNode<TreeData>) => {
          finalSelectedLabels.push(this.collectionSelectedLabels(node));
          finalSelectedValue.push(this.collectionSelectedValues(node));
          node.children?.forEach(pushSelectedValues);
        };
        for (const multipleSelectedValue of multipleSelectedValues) {
          const submitIndex = multipleSelectedValue.length - 1;
          const key = multipleSelectedValue[submitIndex];
          const selectedNode = selectedNodes.find((v) => v.key === key);
          if (selectedNode && (changeOnSelect || lastedMetadata.key === selectedNode.value.metadata.key)) {
            finalSelectedLabels.push(this.collectionSelectedLabels(selectedNode));
            finalSelectedValue.push(multipleSelectedValue);
            selectedNode.children?.forEach(pushSelectedValues);
          }
        }
      } else if (multipleCheckedStrategy === CascaderCheckedStrategy.SHOW_PARENT) {
        for (const multipleSelectedValue of multipleSelectedValues) {
          const submitIndex = multipleSelectedValue.length - 1;
          const key = multipleSelectedValue[submitIndex];
          const selectedNode = selectedNodes.find((v) => v.key === key);
          if (selectedNode && (changeOnSelect || lastedMetadata.key === selectedNode.value.metadata.key)) {
            finalSelectedLabels.push(this.collectionSelectedLabels(selectedNode));
            finalSelectedValue.push(multipleSelectedValue);
          }
        }
      } else {
        for (const multipleSelectedValue of multipleSelectedValues) {
          const submitIndex = multipleSelectedValue.length - 1;
          const key = multipleSelectedValue[submitIndex];
          const selectedNode = selectedNodes.find((v) => v.key === key);
          if (selectedNode && (changeOnSelect || lastedMetadata.key === selectedNode.value.metadata.key)) {
            finalSelectedLabels.push(this.collectionSelectedLabels(selectedNode));
            finalSelectedValue.push(multipleSelectedValue);
          }
        }
      }
      this.selectedLabels = finalSelectedLabels;
      return finalSelectedValue;
    }
    const singleSelectedValue = selectedValue as string[];
    const submitIndex = singleSelectedValue.length - 1;
    const key = singleSelectedValue[submitIndex];
    const selectedNode = selectedNodes[0];
    if (selectedNode.key !== key) {
      return false;
    }
    if (selectedNode && (changeOnSelect || lastedMetadata.key === selectedNode.value.metadata.key)) {
      this.selectedLabels = this.collectionSelectedLabels(selectedNode);
      return selectedValue;
    }
    return false;
  }

  protected async fetchBackfillData(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): Promise<TreeNodeResponseBody[] | undefined> {
    if (this.isFetchAll) {
      this.enableLoadData = false;
      return TreeService.fetchAll(metadataList, { expressionParameters: this.generatorExpressionParameters() });
    }
    return TreeService.reverselyQueryWithSize(currentValues, metadataList, {
      expressionParameters: this.generatorExpressionParameters()
    });
  }

  protected backfillDataProcess({ selectedNodes }) {
    if (this.selectMode === SelectMode.multiple) {
      const selectedValues: string[][] = [];
      const selectedLabels: string[][] = [];
      const repeatKeySet = new Set<string>();
      const pks = this.model.pks || [];
      const usingNodeKey = !pks.length;
      for (const selectedNode of selectedNodes) {
        let key: string;
        if (usingNodeKey) {
          key = selectedNode.key;
        } else {
          const data = selectedNode.value.data;
          if (data) {
            key = pks.map((pk) => `${data[pk]}`).join('#');
          } else {
            key = selectedNode.key;
          }
        }
        if (ObjectUtils.isRepeat(repeatKeySet, key)) {
          continue;
        }
        selectedValues.push(this.collectionSelectedValues(selectedNode));
        selectedLabels.push(this.collectionSelectedLabels(selectedNode));
      }
      this.selectedValue = selectedValues;
      this.selectedLabels = selectedLabels;
    } else {
      this.selectedValue = this.collectionSelectedValues(selectedNodes[0]);
      this.selectedLabels = this.collectionSelectedLabels(selectedNodes[0]);
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

  protected collectionSelectedValues(selectedNode: OioTreeNode<TreeData> | undefined) {
    let values: string[] = [];
    while (selectedNode) {
      if (selectedNode.parent) {
        values = [selectedNode.key, ...values];
      }
      selectedNode = selectedNode.parent;
    }
    return values;
  }

  protected collectionSelectedLabels(selectedNode: OioTreeNode<TreeData> | undefined) {
    let labels: string[] = [];
    while (selectedNode) {
      if (selectedNode.parent) {
        labels = [selectedNode.title || '', ...labels];
      }
      selectedNode = selectedNode.parent;
    }
    return labels;
  }
}
