import { OioListItem, OioTreeNode, TreeHelper, TreeNode, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { IdModel, NameCodeModel, TreeModel } from '../typing';
import { GenericFunctionService } from './GenericFunctionService';
import { QueryPageResult, QueryPagination, QueryWrapper } from './metadata';

export interface ModelApi<T extends IdModel> {
  queryListByWrapper(queryWrapper: QueryWrapper): Promise<T[]>;

  queryPage(page: QueryPagination, queryWrapper: QueryWrapper): Promise<QueryPageResult<T>>;
}

export interface ListModelApi<T extends IdModel> extends ModelApi<T> {
  convertListData(
    list: T[],
    options?: {
      computeKey?: (data: T) => string;
      computeLabel?: (data: T) => string;
    }
  ): OioListItem<T>[];
}

export interface TreeModelApi<T extends IdModel> extends ListModelApi<T> {
  convertTreeData(
    list: T[],
    options?: {
      computeKey?: (data: T) => string;
      computeParentKey?: (data: T) => string | undefined;
      computeLabel?: (data: T) => string;
      convertNode?: (node: OioTreeNode<T>) => void;
    }
  ): OioTreeNode<T>[];
}

export abstract class AbstractModelApi<T extends IdModel> implements ModelApi<T> {
  protected abstract get modelModel(): string;

  public async queryListByWrapper(queryWrapper: QueryWrapper): Promise<T[]> {
    return (
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.modelModel, 'queryListByWrapper', queryWrapper)) ||
      []
    );
  }

  public async queryPage(page: QueryPagination, queryWrapper: QueryWrapper): Promise<QueryPageResult<T>> {
    return (
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.modelModel, 'queryPage', page, queryWrapper)) || {
        content: [],
        totalPages: 0,
        totalElements: 0
      }
    );
  }
}

export abstract class AbstractListModelApi<T extends NameCodeModel>
  extends AbstractModelApi<T>
  implements ListModelApi<T>
{
  public convertListData(
    list: T[],
    options?: {
      computeKey?: () => string;
      computeLabel?: () => string;
    }
  ): OioListItem<T>[] {
    const computeKey = options?.computeKey || this.defaultComputeKey.bind(this);
    const computeLabel = options?.computeLabel || this.defaultComputeLabel.bind(this);
    return list.map((v) => {
      const key = computeKey(v);
      const option: OioListItem<T> = {
        key,
        value: key,
        label: computeLabel(v),
        data: v
      };
      return option;
    });
  }

  protected defaultComputeKey(data: T): string {
    return data.code || uniqueKeyGenerator();
  }

  protected defaultComputeLabel(data: T): string {
    return data.name || data.code || data.id || uniqueKeyGenerator();
  }
}

export abstract class AbstractTreeModelApi<T extends NameCodeModel & TreeModel>
  extends AbstractListModelApi<T>
  implements TreeModelApi<T>
{
  public convertTreeData(
    list: T[],
    options?: {
      computeKey?: (data: T) => string;
      computeParentKey?: (data: T) => string | undefined;
      computeLabel?: (data: T) => string;
      convertNode?: (node: OioTreeNode<T>) => void;
    }
  ): OioTreeNode<T>[] {
    const computeKey = options?.computeKey || this.defaultComputeKey.bind(this);
    const computeParentKey = options?.computeParentKey || this.defaultComputeParentKey.bind(this);
    const computeLabel = options?.computeLabel || this.defaultComputeLabel.bind(this);
    return TreeHelper.convert<T, T, OioTreeNode<T>>(
      list,
      computeKey,
      computeParentKey,
      (v) => v,
      (key, value, parent) => {
        const node = TreeNode.newInstance(key, value, parent as TreeNode<T>) as OioTreeNode<T>;
        if (value) {
          node.title = computeLabel(value);
          options?.convertNode?.(node);
        }
        return node;
      },
      (node) => {
        const { title, value } = node;
        if (!title) {
          node.title = computeLabel(value);
          options?.convertNode?.(node);
        }
        return node;
      }
    );
  }

  protected defaultComputeParentKey(data: T): string | undefined {
    return data.parentCode;
  }
}
