import { ActiveRecord, Pagination, resolveDynamicDomain } from '@kunlun/engine';
import { ExpressionRunParam } from '@kunlun/expression';
import { SYSTEM_MODULE_NAME } from '@kunlun/meta';
import { GQL } from '@kunlun/request';
import { http, IQueryPageResult } from '@kunlun/service';
import { CastHelper, GraphqlHelper, TreeHelper, TreeNode, uniqueKeyGenerator } from '@kunlun/shared';
import { OioTreeNode } from '@kunlun/vue-ui-common';
import { cloneDeep } from 'lodash-es';
import { CardCascaderItemData, TreeData, TreeNodeMetadata } from '../../typing';

type ResponseBody = {
  label: string;
  metadataKey: string;
  value: string;
  isLeaf: boolean;
};

export interface TreeNodeResponseBody {
  label: string;
  value: string;
  key: string;
  parentKeys: string[];
  metadataKey: string;
  isLeaf: boolean;
}

function buildMetadataGQLParameter(
  key: string | undefined,
  metadata: TreeNodeMetadata | undefined,
  options?: {
    disableSelfReferences?: boolean;
    expressionParameters?: ExpressionRunParam;
  }
) {
  if (!metadata) {
    return '';
  }
  let { filter } = metadata;
  const expressionParameters = options?.expressionParameters;
  if (filter && expressionParameters) {
    filter = resolveDynamicDomain(
      filter,
      expressionParameters.activeRecord || expressionParameters.activeRecords?.[0] || {},
      expressionParameters.rootRecord,
      expressionParameters.openerRecord
    );
  }
  return `${key ? `${key}: ` : ''} {
      ${GraphqlHelper.buildStringGQLParameter('key', metadata.key)}
      ${GraphqlHelper.buildStringGQLParameter('model', metadata.model)}
      ${GraphqlHelper.buildStringGQLParameter('relModel', metadata.references?.model)}
      ${GraphqlHelper.buildStringGQLParameter('relField', metadata.references?.fieldName)}
      ${
        options?.disableSelfReferences
          ? ''
          : GraphqlHelper.buildStringGQLParameter('selfRelField', metadata.selfReferences?.fieldName)
      }
      ${GraphqlHelper.buildStringGQLParameter('filter', filter, true)}
      ${GraphqlHelper.buildStringGQLParameter('label', metadata.label)}
      ${GraphqlHelper.buildNotStringGQLParameter(
        'labelFields',
        GraphqlHelper.serializableStringArray(metadata.labelFields || [])
      )}
      ${GraphqlHelper.buildNotStringGQLParameter(
        'searchFields',
        GraphqlHelper.serializableStringArray(metadata.searchFields || [])
      )}
    }`;
}

export interface TreeFetchChildrenOptions {
  disableSelfReferences?: boolean;
  selfFilter?: string;
  filter?: string;
  selfDomain?: string;
  domain?: string;
  expressionParameters?: ExpressionRunParam;
}

export class TreeService {
  /**
   * 获取下一个需要查询的元数据定义
   * @param node 当前选中节点
   */
  public static getNextMetadata<V extends TreeData = TreeData>(
    node: OioTreeNode<V>
  ): { isRoot: boolean; nextMetadata: TreeNodeMetadata | undefined } {
    const isRoot = !node.parent;
    const { metadata } = node.value;
    let nextMetadata: TreeNodeMetadata | undefined;
    if (isRoot) {
      nextMetadata = metadata;
    } else {
      nextMetadata = metadata.child;
    }
    return {
      isRoot,
      nextMetadata
    };
  }

  public static async fetchChildren(
    node: OioTreeNode<TreeData | CardCascaderItemData>,
    options?: TreeFetchChildrenOptions
  ): Promise<IQueryPageResult<ResponseBody>> {
    const { metadata, data, pagination } = node.value;
    let { nextMetadata } = TreeService.getNextMetadata(node);
    let currentMetadata: TreeNodeMetadata | undefined;
    const isRoot = !node.parent;
    if (!isRoot) {
      currentMetadata = metadata;
    }
    if (currentMetadata && options) {
      let { selfFilter } = options;
      if (selfFilter) {
        currentMetadata = cloneDeep(currentMetadata);
        const metadataFilter = currentMetadata.filter;
        if (metadataFilter) {
          selfFilter = `(${metadataFilter}) and (${selfFilter})`;
        }
        currentMetadata.filter = selfFilter;
      }
    }
    if (nextMetadata && options) {
      let { filter } = options;
      if (filter) {
        nextMetadata = cloneDeep(nextMetadata);
        const metadataFilter = nextMetadata.filter;
        if (metadataFilter) {
          filter = `(${metadataFilter}) and (${filter})`;
        }
        nextMetadata.filter = filter;
      }
    }
    let value = '';
    if (data && Object.keys(data).length) {
      value = GraphqlHelper.serializableObject(data);
    }
    const { searchValue: keywords, parentNode } = node.value as CardCascaderItemData;
    if (isRoot && parentNode) {
      currentMetadata = parentNode.value.metadata;
      const parentData = parentNode.value.data;
      if (parentData && Object.keys(parentData).length) {
        value = GraphqlHelper.serializableObject(parentData);
      }
    }
    const gql = `query {
	uiTreeNodeQuery {
		fetchChildren (
		  ${GraphqlHelper.buildStringGQLParameter(
        'keywords',
        keywords ? GraphqlHelper.serializableString(keywords) : undefined
      )}
		  ${GraphqlHelper.buildNotStringGQLParameter('currentNode', value ? `{ value: "${value}" }` : undefined)}
			${buildMetadataGQLParameter('selfMetadata', currentMetadata, options)}
			${buildMetadataGQLParameter('nextMetadata', nextMetadata, { expressionParameters: options?.expressionParameters })}
			${buildMetadataGQLParameter('afterNextMetadata', nextMetadata?.child, {
        expressionParameters: options?.expressionParameters
      })}
			pagination: { currentPage: ${pagination!.current}, size: ${pagination!.pageSize} }
		) {
			content {
			  label
				value
				metadataKey
				isLeaf
			}
			currentPage
			totalPages
			totalElements
		}
	}
}
`;
    const result = await http.query<IQueryPageResult<ResponseBody>>(SYSTEM_MODULE_NAME.BASE, gql, undefined, {
      batch: true
    });
    return result.data.uiTreeNodeQuery.fetchChildren;
  }

  public static async fetchAll(
    metadataList: TreeNodeMetadata[],
    options?: {
      expressionParameters?: ExpressionRunParam;
    }
  ): Promise<TreeNodeResponseBody[]> {
    const gql = `query {
	uiTreeNodeQuery {
		fetchAll (
		  metadataList: [${metadataList.map((v) => buildMetadataGQLParameter('', v, options)).join(',')}]
		) {
		  label
			value
			key
			parentKeys
			metadataKey
			isLeaf
		}
	}
}
`;
    const result = await http.query<TreeNodeResponseBody[]>(SYSTEM_MODULE_NAME.BASE, gql);
    return result.data.uiTreeNodeQuery.fetchAll;
  }

  public static async queryKeywords4Tree(
    keywords: string,
    metadataList: TreeNodeMetadata[],
    options?: {
      expressionParameters?: ExpressionRunParam;
    }
  ): Promise<TreeNodeResponseBody[]> {
    const gql = `query {
	uiTreeNodeQuery {
		queryKeywords4Tree (
		  keywords: "${GraphqlHelper.serializableString(keywords)}"
		  metadataList: [${metadataList.map((v) => buildMetadataGQLParameter('', v, options)).join(',')}]
		) {
		  label
			value
			key
			parentKeys
			metadataKey
			isLeaf
		}
	}
}
`;
    const result = await http.query<TreeNodeResponseBody[]>(SYSTEM_MODULE_NAME.BASE, gql);
    return result.data.uiTreeNodeQuery.queryKeywords4Tree;
  }

  public static async queryKeywords4InnerSelfTree(
    keywords: string,
    node: OioTreeNode<CardCascaderItemData>
  ): Promise<TreeNodeResponseBody[]> {
    const { metadata, parentNode } = node.value;
    let value = '';
    if (parentNode) {
      const { data } = parentNode.value;
      if (data && Object.keys(data).length) {
        value = GraphqlHelper.serializableObject(data);
      }
    }
    const gql = `query {
	uiTreeNodeQuery {
		queryKeywords4InnerSelfTree (
		  keywords: "${GraphqlHelper.serializableString(keywords)}"
		  ${GraphqlHelper.buildNotStringGQLParameter('parentNode', value ? `{ value: "${value}" }` : undefined)}
		  ${buildMetadataGQLParameter('currentNodeMetadata', metadata)}
		  ${buildMetadataGQLParameter('nextNodeMetadata', metadata.child)}
		) {
		  label
			value
			key
			parentKeys
			metadataKey
			isLeaf
		}
	}
}
`;
    const result = await http.query<TreeNodeResponseBody[]>(SYSTEM_MODULE_NAME.BASE, gql);
    return result.data.uiTreeNodeQuery.queryKeywords4InnerSelfTree;
  }

  public static async reverselyQuery(
    values: ActiveRecord[],
    metadataList: TreeNodeMetadata[],
    options?: {
      expressionParameters?: ExpressionRunParam;
    }
  ): Promise<TreeNodeResponseBody[]> {
    return GQL.query('uiTreeNodeQuery', 'reverselyQuery')
      .buildRequest((builder) =>
        builder
          .objectParameter(
            'leafNodes',
            `[${values.map((v) => `{ value: "${GraphqlHelper.serializableObject(v)}" }`).join(', ')}]`
          )
          .objectParameter(
            'metadataList',
            `[${metadataList.map((v) => buildMetadataGQLParameter('', v, options)).join(',')}]`
          )
      )
      .buildResponse((builder) => builder.parameter('label', 'value', 'key', 'parentKeys', 'metadataKey', 'isLeaf'))
      .request(SYSTEM_MODULE_NAME.BASE);
  }

  public static async reverselyQueryWithSize(
    values: ActiveRecord[],
    metadataList: TreeNodeMetadata[],
    options?: {
      expressionParameters?: ExpressionRunParam;
    }
  ): Promise<TreeNodeResponseBody[]> {
    return GQL.query('uiTreeNodeQuery', 'reverselyQueryWithSize')
      .buildRequest((builder) =>
        builder
          .numberParameter('size', 50)
          .objectParameter(
            'leafNodes',
            `[${values.map((v) => `{ value: "${GraphqlHelper.serializableObject(v)}" }`).join(', ')}]`
          )
          .objectParameter(
            'metadataList',
            `[${metadataList.map((v) => buildMetadataGQLParameter('', v, options)).join(',')}]`
          )
      )
      .buildResponse((builder) => builder.parameter('label', 'value', 'key', 'parentKeys', 'metadataKey', 'isLeaf'))
      .request(SYSTEM_MODULE_NAME.BASE);
  }

  public static convertTreeByResponseBody<V extends TreeData = TreeData>(
    treeDefinition: TreeNodeMetadata,
    list: TreeNodeResponseBody[],
    options: { defaultPagination?: Pagination; computeNodeTitle(value: V): string }
  ): { nodes: OioTreeNode<V>[]; expandedKeys: string[] } {
    const expandedKeys: string[] = [];
    const isUsingPagination = !!options.defaultPagination;
    const nodes = CastHelper.cast<OioTreeNode<V>[]>(
      TreeHelper.convert<TreeNodeResponseBody, V, OioTreeNode<V>>(
        list,
        (v) => {
          const key = v.key || uniqueKeyGenerator();
          expandedKeys.push(key);
          return key;
        },
        (v) => v.parentKeys,
        (v) => {
          const { label, metadataKey, value } = v;
          if (metadataKey) {
            let metadata: TreeNodeMetadata | undefined = treeDefinition;
            while (metadata) {
              if (metadata.key === metadataKey) {
                return {
                  label,
                  metadata,
                  data: JSON.parse(value),
                  pagination: isUsingPagination ? { ...options.defaultPagination } : undefined
                } as V;
              }
              metadata = metadata.child;
            }
          }
          return undefined;
        },
        (key, value, parent) => {
          const node = CastHelper.cast<OioTreeNode<V>>(TreeNode.newInstance(key, value, CastHelper.cast(parent)));
          if (value) {
            node.title = options.computeNodeTitle(value);
          }
          node.loaded = true;
          return node;
        },
        (node, value) => {
          node.title = options.computeNodeTitle(value);
          return node;
        }
      )
    );
    return {
      nodes,
      expandedKeys
    };
  }
}
