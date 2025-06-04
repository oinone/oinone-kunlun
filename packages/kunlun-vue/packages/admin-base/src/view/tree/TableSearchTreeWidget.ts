import { isRelationField } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { DEFAULT_FALSE_CONDITION, DEFAULT_TRUE_CONDITION } from '@oinone/kunlun-service';
import { NumberHelper, ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../basic';
import { DropMode, TreeData, TreeRefreshCallChainingParameters } from '../../typing';
import { TreeUtils } from '../../util';
import { AbstractTreeElementWidget } from './AbstractTreeElementWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: [ViewType.Table, ViewType.Form],
    widget: 'tree'
  })
)
export class TableSearchTreeWidget extends AbstractTreeElementWidget {
  protected async onNodeSelected(node: OioTreeNode<TreeData>) {
    await this.onSelectedForSearch(node);
  }

  protected async onNodeUnselected() {
    await this.onUnselected();
  }

  protected async onClearSearch() {
    await this.onUnselected();
  }

  // 最大勾选数量
  @Widget.Reactive()
  public get maxCheckCount() {
    return NumberHelper.toNumber(this.getDsl().maxCheckCount) || -1;
  }

  // 超出最大勾选数量后的丢弃模式
  @Widget.Reactive()
  public get dropMode() {
    return this.getDsl().dropMode || DropMode.DropEarliest;
  }

  protected delKey(targetKey) {
    const checkedKeys = [...(this.checkedKeys || [])];
    const index = checkedKeys.findIndex((key) => key === targetKey);
    if (index > -1) {
      checkedKeys.splice(index, 1);
    }
    this.checkedKeys = checkedKeys;
  }

  protected insertKey(targetKey) {
    if (!this.checkedKeys) {
      this.checkedKeys = [];
    }
    if (!this.checkedKeys.includes(targetKey)) {
      if (this.maxCheckCount === -1 || this.checkedKeys.length < this.maxCheckCount) {
        this.checkedKeys.push(targetKey);
      } else {
        // 超出最大选中数量
        switch (this.dropMode) {
          case DropMode.DropEarliest:
            this.checkedKeys.shift();
            this.checkedKeys.push(targetKey);
            break;
          case DropMode.DropCurrent:
            break;
          default:
            console.warn('Unsupported dropMode, use dropMode earliest instead');

            this.checkedKeys.shift();
            this.checkedKeys.push(targetKey);
            break;
        }
      }
    }
  }

  @Widget.Method()
  protected async onSearch(keywords: string): Promise<void> {
    await super.onSearch(keywords);
    this.updateCheckAllStatus();
  }

  @Widget.Method()
  protected updateCheckAllStatus(allKeys?: string[]) {
    let allKeysActive: string[] = [];
    if (allKeys) {
      allKeysActive = allKeys;
    } else {
      allKeysActive = (this.searchRootNode ?? this.rootNode)?.children.map((c) => c.key) ?? [];
    }
    if (!this.checkedKeys?.length) {
      return;
    }
    let isCheckAll = true;
    allKeysActive.forEach((key) => {
      if (!this.checkedKeys?.includes(key)) {
        isCheckAll = false;
      }
    });
    if (isCheckAll) {
      this.insertKey(TreeUtils.SELECT_ALL_KEY);
    } else {
      this.delKey(TreeUtils.SELECT_ALL_KEY);
    }
  }

  @Widget.Method()
  public onChecked(node: OioTreeNode<TreeData>, checked: boolean): ReturnPromise<void> {
    this.onCheckedSearch(node, checked);
  }

  @Widget.Method()
  public onCheckedAll(checkdAll: boolean): ReturnPromise<void> {
    this.onCheckedAllSearch(checkdAll);
  }

  protected async onCheckedSearch(node: OioTreeNode<TreeData>, checked: boolean) {
    if (!this.searchRootNode) {
      this.onCheckedCommon(node, checked);
      return;
    }
    if (!checked) {
      this.delKey(TreeUtils.SELECT_ALL_KEY);
      this.delKey(node.key);
    } else {
      this.insertKey(node.key);
      const allKeys = this.searchRootNode?.children.map((c) => c.key);
      this.updateCheckAllStatus(allKeys);
    }

    await this.onCheckedForSearch(this.checkedKeys);
  }

  protected async onCheckedAllSearch(checkedAll: boolean) {
    if (!this.searchRootNode) {
      this.onCheckedAllCommon(checkedAll);
      return;
    }
    const searchKeys = this.searchRootNode.children.map((c) => c.key);
    this.checkedKeys = this.checkedKeys?.filter((key) => !searchKeys.includes(key)) ?? [];
    if (checkedAll) {
      this.checkedKeys.push(...searchKeys);
    }
    this.updateCheckAllStatus(searchKeys);
    await this.onCheckedForSearch(this.checkedKeys);
  }

  protected async onCheckedCommon(node: OioTreeNode<TreeData>, checked: boolean) {
    if (!checked) {
      this.delKey(TreeUtils.SELECT_ALL_KEY);
      this.delKey(node.key);
    } else {
      this.insertKey(node.key);
      const allKeys = this.rootNode?.children.map((c) => c.key);
      this.updateCheckAllStatus(allKeys);
    }
    await this.onCheckedForSearch(this.checkedKeys);
  }

  protected async onCheckedAllCommon(checkedAll: boolean) {
    if (!checkedAll) {
      this.checkedKeys = [];
    } else {
      const allKeys = this.rootNode?.children.map((c) => c.key) as string[];
      this.checkedKeys = allKeys;
      this.updateCheckAllStatus(allKeys);
    }
    await this.onCheckedForSearch(this.checkedKeys);
  }

  protected async onCheckedForSearch(checkedKeys: string[] | undefined): Promise<boolean> {
    if (!checkedKeys || !this.rootNode) {
      return false;
    }

    this.setRuntimeCheckedState(checkedKeys);

    if (!checkedKeys.length) {
      this.onUnselected();
      return true;
    }

    const keyNodeMap = new Map<string, OioTreeNode<TreeData>>();

    this.buildKeyNodeMap(this.rootNode, keyNodeMap);

    const activeTreeContext = {};

    const conditionsPromises = checkedKeys.map(async (checkedKey) => {
      const node = keyNodeMap.get(checkedKey);
      if (!node) {
        return Promise.resolve(null);
      }

      const { metadata, data } = node.value;
      if (!metadata || !data) {
        return Promise.resolve(null);
      }
      const { model, search } = metadata;
      if (!search) {
        return Promise.resolve(null);
      }

      const modelField = await TreeUtils.getModelFieldMetadata(search, model);
      if (!modelField || !isRelationField(modelField)) {
        return Promise.resolve(null);
      }
      let targetCondition: Condition | undefined;
      const res = await TreeUtils.consumerReferenceModelField(
        model,
        modelField,
        (originFields, targetFields, fieldIndex) => {
          const value = data[originFields[fieldIndex]];
          const fieldKey = targetFields[fieldIndex];
          const splitKeys = fieldKey.split('.');

          if (splitKeys.length === 1) {
            activeTreeContext[fieldKey] = value;
          } else {
            splitKeys.reduce((context, key, index) => {
              if (index === splitKeys.length - 1) {
                context[key] = value;
              } else if (!context[key]) {
                context[key] = {};
              }
              return context[key];
            }, activeTreeContext);
          }
          targetCondition = TreeUtils.newCondition(fieldKey, value);
        }
      );

      if (res && targetCondition) {
        return Promise.resolve(targetCondition);
      }
      return Promise.resolve(null);
    });

    const results: Condition[] = (await Promise.all(conditionsPromises)).filter((v) => !!v) as Condition[];
    if (results.length) {
      const combileCondition = new Condition(DEFAULT_TRUE_CONDITION);
      results.forEach((result, index) => {
        if (index === 0) {
          combileCondition.and(result);
        } else {
          combileCondition.or(result);
        }
      });

      this.setRuntimeFilter(combileCondition);

      this.rootRuntimeContext.view.context = {
        ...(this.rootRuntimeContext.view.context || {}),
        activeTreeContext,
        rootConditionBodyData: activeTreeContext
      };

      const refreshParameters: TreeRefreshCallChainingParameters = {
        isSkipRefreshSelf: true,
        refreshParent: false,
        currentPage: 1
      };
      this.parentRefreshCallChaining?.syncCall(refreshParameters);
      return true;
    }

    /**
     * 搜索条件异常时，不显示任何数据
     */
    this.setRuntimeFilter(new Condition(DEFAULT_FALSE_CONDITION));
    const refreshParameters: TreeRefreshCallChainingParameters = {
      isSkipRefreshSelf: true,
      refreshParent: false,
      currentPage: 1
    };
    this.parentRefreshCallChaining?.syncCall(refreshParameters);
    return false;
  }

  protected buildKeyNodeMap(node: OioTreeNode, map: Map<string, OioTreeNode>): void {
    map.set(node.key, node);
    node.children?.forEach((child) => this.buildKeyNodeMap(child, map));
  }

  protected setRuntimeCheckedState(checkedKeys: string[]) {
    const view = this.metadataRuntimeContext.view;
    if (view) {
      view.extension = {
        ...(view.extension ?? {}),
        checkedKeys,
        rootNode: this.rootNode,
        searchRootNode: this.searchRootNode,
        searchValue: this.searchValue
      };
    }
  }
}
