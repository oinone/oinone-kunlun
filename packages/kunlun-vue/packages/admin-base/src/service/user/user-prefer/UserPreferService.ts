import { activeRecordsToJSONString, QueryPageResult } from '@kunlun/engine';
import { SYSTEM_MODULE_NAME } from '@kunlun/meta';
import { gql, HttpClient } from '@kunlun/request';
import { GraphqlHelper, StringHelper } from '@kunlun/shared';
import { UserSearchPrefer, UserTablePrefer, UserTablePreferFieldWidth } from '../../../typing';

const http = HttpClient.getInstance();

const objectArrayToJson = (arr?: object[]): string | undefined => {
  if (arr === null) {
    return '';
  }
  if (arr?.length) {
    return GraphqlHelper.serializableObjectArray(arr);
  }
};

const arrayToString = (arr?: string[]): string | undefined => {
  if (arr === null) {
    return '';
  }
  if (arr?.length) {
    return arr.map((a) => a.trim()).join(',');
  }
};

export class UserPreferService {
  public static parsePreferForTable(userPrefer: Record<string, unknown> | undefined): UserTablePrefer | undefined {
    if (!userPrefer) {
      return undefined;
    }
    const data = userPrefer as {
      id?: string;
      fieldPrefer?: string;
      fieldOrder?: string;
      fieldLeftFixed?: string;
      fieldRightFixed?: string;
      fieldWidth?: string;
      resModel: string;
      viewName: string;
    };
    if (!data.id) {
      return undefined;
    }

    let fieldWidth: UserTablePreferFieldWidth[] | undefined;

    if (data.fieldWidth) {
      try {
        fieldWidth = JSON.parse(data.fieldWidth);
      } catch (e) {
        console.error(e);
      }
    }
    if (!fieldWidth) {
      fieldWidth = [];
    }

    return {
      id: data.id,
      fieldPrefer: StringHelper.convertArray(data.fieldPrefer) || [],
      fieldOrder: StringHelper.convertArray(data.fieldOrder) || [],
      fieldLeftFixed: StringHelper.convertArray(data.fieldLeftFixed) || [],
      fieldRightFixed: StringHelper.convertArray(data.fieldRightFixed) || [],
      fieldWidth,
      model: data.resModel,
      viewName: data.viewName
    };
  }

  public static async savePreferForTable(userPrefer: UserTablePrefer) {
    const fieldOrder = arrayToString(userPrefer.fieldOrder);
    const fieldPrefer = arrayToString(userPrefer.fieldPrefer);
    const fieldWidth = objectArrayToJson(userPrefer.fieldWidth);
    const fieldLeftFixed = arrayToString(userPrefer.fieldLeftFixed);
    const fieldRightFixed = arrayToString(userPrefer.fieldRightFixed);

    const body = gql`
      mutation {
        userListFieldPreferStoreMutation {
          save(data: {
            resModel: "${userPrefer.model}"
            viewName: "${userPrefer.viewName}"
            ${GraphqlHelper.buildStringGQLParameter('fieldOrder', fieldOrder)}
            ${GraphqlHelper.buildStringGQLParameter('fieldPrefer', fieldPrefer)}
            ${GraphqlHelper.buildStringGQLParameter('fieldWidth', fieldWidth)}
            ${GraphqlHelper.buildStringGQLParameter('fieldLeftFixed', fieldLeftFixed)}
            ${GraphqlHelper.buildStringGQLParameter('fieldRightFixed', fieldRightFixed)}
          }) {
            id
            fieldPrefer
            fieldOrder
            fieldWidth
            fieldLeftFixed
            fieldRightFixed
          }
        }
      }
    `;
    await http.mutate(SYSTEM_MODULE_NAME.USER, body);
  }

  public static async queryPreferForSearch(model: string, viewName: string): Promise<UserSearchPrefer[]> {
    const body = gql`
      query {
        userQueryPreferStoreQuery {
          queryPage(page: { size: -1, currentPage: 1 }, queryWrapper: { rsql: "partnerId == $\{currentUser\} and resModel == '${model}' and resViewName == '${viewName}'" }) {
            content {
              id
              name
              searchPrefer
            }
          }
        }
      }
    `;
    return http
      .mutate<QueryPageResult<{ id: string; name: string; searchPrefer: string }>>(SYSTEM_MODULE_NAME.USER, body)
      .then((result) => {
        return result.data.userQueryPreferStoreQuery.queryPage.content.map((v) => {
          const sarchPrefer: UserSearchPrefer = {
            id: v.id,
            model,
            viewName,

            name: v.name,
            searchPrefer: JSON.parse(v.searchPrefer)
          };
          return sarchPrefer;
        });
      });
  }

  public static async createPreferForSearch(userPrefer: UserSearchPrefer): Promise<UserSearchPrefer> {
    const body = gql`
      mutation {
        userQueryPreferStoreMutation {
          create(data: {
            resModel: "${userPrefer.model}"
            resViewName: "${userPrefer.viewName}"
            name: "${userPrefer.name}"
            searchPrefer: ${JSON.stringify(activeRecordsToJSONString(userPrefer.searchPrefer))}
          }) {
            id
          }
        }
      }
    `;
    const result = await http.mutate<UserSearchPrefer>(SYSTEM_MODULE_NAME.USER, body);
    return {
      ...userPrefer,
      id: result.data.userQueryPreferStoreMutation.create.id
    };
  }

  public static async updatePreferNameForSearch(id: string, name: string) {
    const body = gql`
      mutation {
        userQueryPreferStoreMutation {
          update(data: {
            id: "${id}"
            name: "${name}"
          }) {
            id
            name
          }
        }
      }
    `;
    const result = await http.mutate('user', body);
    return result.data.userQueryPreferStoreMutation.create;
  }

  public static async deletePreferForSearch(id: string) {
    const body = gql`
      mutation {
        userQueryPreferStoreMutation {
          delete(dataList: [{ id: "${id}" }]) {
            id
          }
        }
      }
    `;
    const result = await http.mutate('user', body);
    return result.data.userQueryPreferStoreMutation.delete;
  }
}
