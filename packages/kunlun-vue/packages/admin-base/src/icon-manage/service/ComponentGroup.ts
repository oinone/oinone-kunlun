import { IModelField, ModelFieldType } from '@oinone/kunlun-meta';
import { buildSingleItemParam, http } from '@oinone/kunlun-service';

const MODULE_NAME = 'uiDesigner';

/**
 * 组件分组相关的API操作
 */
class ComGroupService {
  static groupList: any[] = [];

  static async create(displayName: string) {
    const body = `mutation {
      uiDesignerWidgetGroupProxyMutation {
        create(
          data: {
            displayName: "${displayName}"
          }
        ) {
          id
          name
          displayName
          active
          priority
          sys
        }
      }
    }`;

    const rst = await http.query(MODULE_NAME, body);

    return rst.data.uiDesignerWidgetGroupProxyMutation.create;
  }

  static async update(displayName: string, id: string) {
    const body = `mutation {
      uiDesignerWidgetGroupProxyMutation {
        update(
          data: {
            displayName: "${displayName}"
            id: "${id}"
          }
        ) {
          id
          name
          displayName
          active
          priority
          sys
        }
      }
    }`;

    const rst = await http.mutate(MODULE_NAME, body);

    return rst.data.uiDesignerWidgetGroupProxyMutation.update;
  }

  static async query(params) {
    const fields = [
      {
        name: 'sys',
        ttype: ModelFieldType.Boolean
      },
      {
        name: 'show',
        ttype: ModelFieldType.Boolean
      },
      {
        name: 'widgetDisplayName',
        ttype: ModelFieldType.String
      }
    ] as unknown as IModelField[];

    const p = await buildSingleItemParam(fields, params);
    const body = `{
      uiDesignerWidgetGroupProxyQuery {
        queryWidgetGroupList(data: ${p}) {
          id
          name
          displayName
          active
          priority
          sys
          widgetCount
        }
      }
    }
    `;

    const rst = await http.query(MODULE_NAME, body);
    const list = rst.data.uiDesignerWidgetGroupProxyQuery.queryWidgetGroupList as unknown as any[];

    return (ComGroupService.groupList = list);
  }

  static async delete(id: string) {
    const body = `mutation {
      uiDesignerWidgetGroupProxyMutation {
        deleteByEntity(
          data: {id: "${id}"}
        ) {
          id
        }
      }
    }`;

    const rst = await http.mutate(MODULE_NAME, body);

    return rst.data.uiDesignerWidgetGroupProxyMutation.deleteByEntity;
  }

  static async sort(group: any[]) {
    const fields = [
      {
        name: 'id',
        ttype: ModelFieldType.Long
      },
      {
        name: 'name',
        ttype: ModelFieldType.String
      }
    ] as IModelField[];

    const builders = group.map((val) => buildSingleItemParam(fields, val));
    const paramArr = await Promise.all(builders);

    const body = `mutation {
      uiDesignerWidgetGroupDataMutation{
        changePriority(data: {
          widgetGroups: [${paramArr.join(',')}]
        }) {
          widgetGroups{
            id
          }
        }
      }
    }`;

    const rst = await http.mutate(MODULE_NAME, body);

    return rst.data.uiDesignerWidgetGroupDataMutation.changePriority;
  }
}

export { ComGroupService };
