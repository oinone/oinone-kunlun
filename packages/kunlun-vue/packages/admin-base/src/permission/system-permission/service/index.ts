import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { GQL } from '@oinone/kunlun-request';
import { http } from '@oinone/kunlun-service';
import { GraphqlHelper } from '@oinone/kunlun-shared';
import { IPermission } from '../../permission/type';
import { AnyPermissionNode, MenuPermissionNode, PermissionNode } from '../../types';

interface IQueryRole {
  currentPage: number;
  name?: string;
  description?: string;
  code?: string;
}

/**
 * 左侧菜单查询
 */
export const queryMenus = async () => {
  const body = `{
    resourcePermissionNodeQuery {
      fetchNode(data: {}) {
          nodesJson
      }
    }
  }`;

  const res = await http.query('auth', body);

  return JSON.parse(res.data.resourcePermissionNodeQuery.fetchNode.nodesJson as any) as any[];
};

/**
 * 查询角色列表
 */
export const queryRoleList = async (
  options: IQueryRole = {
    currentPage: 1,
    name: '',
    description: '',
    code: ''
  }
) => {
  const nameCondition = options.name ? `name=like='${options.name}'` : '';
  const codeCondition = options.code ? `code=like='${options.code}'` : '';
  const desCondition = options.description ? `description=like='${options.description}'` : '';

  const condition = [nameCondition, codeCondition, desCondition].filter((v) => !!v).join(' and ');

  const body = `{
    authRoleQuery {
      queryPage(
        page: {currentPage: ${options.currentPage}, size: -1}
        queryWrapper: {rsql: "${condition}"}
      ) {
        content {
          id
          code
          name
          description
          source
          permissionDataSource
          createDate
          writeDate
        }
        size
        totalPages
        totalElements
      }
    }
  }
  `;
  const res = await http.query('auth', body);

  return res.data.authRoleQuery.queryPage.content as any[];
};

/**
 * 查询分组
 */
export const queryGroups = async (options: { nodeType: string; resourceId: string; path: string }) => {
  const body = `{
	authResourcePermissionGroupsQuery {
		queryGroups(
			data: {
				nodeType: ${options.nodeType}
				resourceId: "${options.resourceId}"
				path: "${options.path}"
			}
		) {
			runtimeGroups {
				id
				name
				type
				dataSource
				active
				displayName
				comment
				menuName
				roles {
					code
					name
					id
					description
					active
					roleTypeCode
				}
			}
			managementGroups {
				id
				name
				type
				dataSource
				active
				displayName
				comment
				menuName
				roles {
					code
					name
					id
					description
					active
					roleTypeCode
				}
			}
		}
	}
}
`;

  const res = await http.query('auth', body);

  return res.data.authResourcePermissionGroupsQuery.queryGroups as {
    runtimeGroups: any;
    managementGroups: any;
  };
};

/**
 * 创建/修改分组
 */
export const createOrUpdateGroup = async (
  options: {
    id: string;
    name: string;
    comment: string;
    roles: any[];
    fieldPermissions: any[];
    actionPermissions: any[];
    rowPermission: any;
    module: string;
    nodeType?: string;
    resourceId?: string;
    path?: string;
  } = {} as any
) => {
  return GQL.mutation('authGroupSystemPermissionProxy', options.id ? 'update' : 'create')
    .buildRequest((builder) => {
      builder.buildObjectParameter('data', (builder) => {
        builder.stringParameter('id', options.id);
        builder.stringParameter('displayName', options.name);
        builder.stringParameter('comment', options.comment);
        builder.enumerationParameter('nodeType', options.nodeType);
        builder.stringParameter('resourceId', options.resourceId);
        builder.stringParameter('path', options.path);
        builder.buildArrayParameter('roles', options.roles, (builder, value) => {
          builder.stringParameter('id', value.id);
        });
        builder.buildArrayParameter('fieldPermissions', options.fieldPermissions, (builder, value) => {
          builder.stringParameter('id', value.id);
          builder.stringParameter('code', value.code);
          builder.stringParameter('path', value.path);
          builder.stringParameter('model', value.model);
          builder.stringParameter('field', value.field);
          builder.booleanParameter('permRead', value.permRead);
          builder.booleanParameter('permWrite', value.permWrite);
        });
        builder.buildArrayParameter('actionPermissions', options.actionPermissions, (builder, value) => {
          builder.stringParameter('id', value.id);
          builder.stringParameter('code', value.code);
          builder.stringParameter('path', value.path);
          builder.stringParameter('module', value.module);
          builder.stringParameter('model', value.model);
          builder.stringParameter('name', value.name);
          builder.booleanParameter('canAccess', value.canAccess);
        });
        const { rowPermission } = options;
        if (rowPermission) {
          builder.buildObjectParameter('rowPermission', (builder) => {
            builder.stringParameter('id', rowPermission.id);
            builder.stringParameter('code', rowPermission.code);
            builder.stringParameter('path', rowPermission.path);
            builder.stringParameter('model', rowPermission.model);
            builder.stringParameter('filter', rowPermission.filter);
            builder.stringParameter('domainExp', rowPermission.domainExp);
            builder.stringParameter('domainExpDisplayName', rowPermission.domainExpDisplayName);
            builder.stringParameter('domainExpJson', rowPermission.domainExpJson);
            builder.booleanParameter('permRead', rowPermission.permRead);
            builder.booleanParameter('permWrite', rowPermission.permWrite);
            builder.booleanParameter('permDelete', rowPermission.permDelete);
          });
        }
      });
    })
    .buildResponse((builder) => {
      builder.parameter('id', 'name', 'displayName', ['roles', ['id', 'name']]);
    })
    .request(SYSTEM_MODULE_NAME.AUTH);
};

/**
 * 修改访问权限组角色
 */
export const modifyRole = async (options: { name: string; roles: any[]; module: string; id: string } = {} as any) => {
  const roles = `${(options.roles || []).map((r) => `{id: "${r.id}"}`).join(',')}`;
  const body = `mutation {
    authGroupSystemPermissionProxyMutation {
      modifyRole(
        data: {
          id: "${options.id}"
          roles: [${roles}]
        }
      ) {
        name
        roles {
          id
          name
        }
      }
    }
  }
  `;

  const res = await http.query('auth', body);

  return res.data.authGroupSystemPermissionProxyMutation.modifyRole;
};

/**
 * 修改管理权限组角色
 */
export const modifyManagementRole = async (
  options: { name: string; roles: any[]; module: string; id: string } = {} as any
) => {
  const roles = `${(options.roles || []).map((r) => `{id: "${r.id}"}`).join(',')}`;
  const body = `mutation {
    authGroupSystemPermissionProxyMutation {
      modifyManagementRole (
        data: {
          id: "${options.id}"
          roles: [${roles}]
        }
      ) {
        name
        roles {
          id
          name
        }
      }
    }
  }
  `;

  const res = await http.query('auth', body);

  return res.data.authGroupSystemPermissionProxyMutation.modifyManagementRole;
};

/**
 * 批量修改角色
 */
export const batchModifyRole = async (options: {
  permissions: PermissionNode[];
  roles: { id: string }[];
}): Promise<{ roles: any[] }> => {
  return GQL.mutation('resourcePermissionNodes', 'authorizes')
    .buildRequest((builder) => {
      builder.buildObjectParameter('data', (builder) => {
        builder.buildArrayParameter('roles', options.roles, (builder, value) => {
          builder.stringParameter('id', value.id);
        });
        builder.buildArrayParameter('permissions', options.permissions, (builder, value) => {
          builder.enumerationParameter('nodeType', value.nodeType);
          builder.stringParameter('resourceId', value.resourceId);
          builder.stringParameter('path', value.path);
        });
      });
    })
    .buildResponse((builder) => {
      builder.parameter(['roles', ['id', 'name']]);
    })
    .request(SYSTEM_MODULE_NAME.AUTH);
};

/**
 * 查询菜单下的动作
 */
export const queryActionsByMenu = async (node: AnyPermissionNode, groupId?: string): Promise<{ nodesJson: string }> => {
  return await GQL.query('resourcePermissionNode', 'fetchNode')
    .buildRequest((builder) => {
      builder.buildObjectParameter('data', (builder) => {
        builder.stringParameter('id', node.id);
        builder.stringParameter('parentId', node.parentId);
        builder.stringParameter('groupId', groupId);
        builder.enumerationParameter('nodeType', node.nodeType);
        builder.stringParameter('resourceId', node.resourceId);
        builder.stringParameter('path', node.path);
      });
    })
    .buildResponse((builder) => {
      builder.parameter('nodesJson');
    })
    .request(SYSTEM_MODULE_NAME.AUTH);
};

/**
 * 查询权限组字段权限和行权限
 */
export const queryGroupData = async (node: AnyPermissionNode, groupId?: string) => {
  const body = `{
    authGroupSystemPermissionProxyQuery {
      fetchData(data: {
          ${GraphqlHelper.buildStringGQLParameter('model', (node as MenuPermissionNode).model)}
          ${GraphqlHelper.buildNotStringGQLParameter('nodeType', node.nodeType)}
          ${GraphqlHelper.buildStringGQLParameter('resourceId', node.resourceId)}
          ${GraphqlHelper.buildStringGQLParameter('path', node.path)}
          ${GraphqlHelper.buildStringGQLParameter('id', groupId)}
        }) {
        fieldPermissions {
          model
          field
          resourceId
          displayValue
          description
          ttype
          permRead
          permWrite
        }
        rowPermission {
          model
          domainExp
          domainExpDisplayName
          domainExpJson
          permRead
          permWrite
          permDelete
        }
      }
    }
  }`;

  const res = await http.query('auth', body);

  return res.data.authGroupSystemPermissionProxyQuery.fetchData as unknown as {
    fieldPermissions: any[];
    rowPermission: any;
  };
};

/**
 * 查询数据权限
 */
export const queryDataPermission = async (authGroupId: string) => {
  const queryStr = `{
      interactionPermissionQuery {
        dataPermissions(interactionPermission: {
              ${GraphqlHelper.buildStringGQLParameter('authGroupId', authGroupId)}
            }) {
            rowPermissions {
              id
              code
              name
              model
              modelDisplayName
              description
              domainExp
              domainExpDisplayName
              permissionType
              active
              permRead
              permWrite
              permDelete
            }
        }
      }
    }`;
  const res = await http.query('auth', queryStr);
  return (res.data.interactionPermissionQuery?.dataPermissions?.rowPermissions || []) as IPermission[];
};

/**
 * 启用/禁用权限组
 */
export const activeOrCancelGroup = async (id: string, value: boolean) => {
  const methodName = value ? 'active' : 'disable';

  const body = `mutation {
    authGroupSystemPermissionProxyMutation {
      ${methodName}(
        data: {
          id: "${id}"
        }
      ) {
        id
        name
      }
    }
  }`;

  const res = await http.query('auth', body);

  return res.data.authGroupSystemPermissionProxyMutation[methodName];
};

/**
 * 删除分组
 */
export const deleteGroupById = async (id: string) => {
  const body = `mutation {
    authGroupSystemPermissionProxyMutation {
      deleteOne(data: {id: "${id}"}) {
        id
        name
      }
    }
  }
  `;

  const res = await http.query('auth', body);

  return res.data.authGroupSystemPermissionProxyMutation.deleteOne;
};

/**
 * 收集权限项
 */
export const collectionPermissionItems = async (node: PermissionNode): Promise<{ id: string }> => {
  return await GQL.mutation('resourcePermissionNode', 'collectionPathMappings')
    .buildRequest((builder) => {
      builder.buildObjectParameter('data', (builder) => {
        builder.stringParameter('id', node.id);
        builder.stringParameter('parentId', node.parentId);
        builder.enumerationParameter('nodeType', node.nodeType);
        builder.stringParameter('resourceId', node.resourceId);
        builder.stringParameter('path', node.path);
      });
    })
    .buildResponse((builder) => {
      builder.parameter('id');
    })
    .request(SYSTEM_MODULE_NAME.AUTH);
};
