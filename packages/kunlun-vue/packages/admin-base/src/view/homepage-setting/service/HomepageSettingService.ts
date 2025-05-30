import { Pagination } from '@kunlun/engine';
import { IModule } from '@kunlun/meta';
import { HttpClient, Condition } from '@kunlun/request';
import { HomePageConfig, HomepageConfigRule } from '../typing';

const http = HttpClient.getInstance();

export async function fetchModuleList(
  currentPagination: Pagination = { current: 1, pageSize: 10000, total: 0 },
  searchText?: string
) {
  const condition = searchText ? new Condition('name').like(searchText) : '';
  const body = `
  query {
    moduleDefinitionQuery {
      queryPage(
        page: { currentPage: ${currentPagination.current}, size: ${currentPagination.pageSize} }
        queryWrapper: {rsql: "${condition.toString()}"} 
      ) {
        content {
          id
          module
          displayName
        }
        totalPages
        totalElements
      }
    }
  }
  `;

  const result = (await http.query('base', body)) as any;
  return result.data.moduleDefinitionQuery.queryPage;
}

export async function fetchModuleOne(moduleName?: string) {
  if (!moduleName) return null;
  const body = `
  query {
    moduleQuery {
      queryOne(query: { module: "${moduleName}" }) {
        id
        module
        displayName
      }
    }
  }
  `;

  const result = (await http.query('base', body)) as any;
  return result.data.moduleQuery.queryOne;
}

export async function fetchUserList(
  moduleName: string,
  currentPagination: Pagination = { current: 1, pageSize: 10000, total: 0 },
  searchText?: string
) {
  const condition = searchText ? new Condition('name').like(searchText) : '';
  const body = `
  query {
    pamirsUserQuery {
      queryPage(
        page: { currentPage: ${currentPagination.current}, size: ${currentPagination.pageSize} }
        queryWrapper: {rsql: "${condition.toString()}", queryData: {name: null, login: null, email: null, phone: null, realname: null, idCard: null}}
      ) {
        content {
          id
          name
          nickname
        }
        totalPages
        totalElements
      }
    }
  }
`;

  const result = (await http.query(moduleName, body)) as any;
  return result.data.pamirsUserQuery.queryPage;
}

export async function fetchRoleList(
  moduleName: string,
  currentPagination: Pagination = { current: 1, pageSize: 10000, total: 0 },
  searchText?: string
) {
  const condition = searchText ? new Condition('name').like(searchText) : '';
  const body = `
  query {
    authRoleQuery {
      queryPage(
        page: { currentPage: ${currentPagination.current}, size: ${currentPagination.pageSize} }
        queryWrapper: {rsql: "${condition.toString()}", queryData: {code: null, name: null}}
      ) {
        content {
          id
          code
          name
        }
        totalPages
        totalElements
      }
    }
  }
`;

  const result = (await http.query(moduleName, body)) as any;
  return result.data.authRoleQuery.queryPage;
}

export async function fetchUserOne(moduleName: string, id: string) {
  const body = `
  query {
    pamirsUserQuery {
      queryOne(
        query: {id:${id}}
      ) {
        id
        name
        nickname
      }
    }
  }
`;

  const result = (await http.query(moduleName, body)) as any;
  return result.data.pamirsUserQuery.queryOne;
}

export async function fetchRoleOne(moduleName: string, id: string) {
  const body = `
  query {
    authRoleQuery {
      queryOne(
        query: {id:${id}}
      ) {
        id
        code
        name
      }
    }
  }
`;

  const result = (await http.query(moduleName, body)) as any;
  return result.data.authRoleQuery.queryOne;
}

export async function saveHomepageSettingConfig(moduleName: string, homepageConfig: HomePageConfig) {
  if (!homepageConfig) return;
  try {
    const body = `
    mutation{
      globalAppConfigProxyMutation{
        saveAdvancedHomePage(data: {
          extend: {
            advancedHomePageConfig:{
              state: ${homepageConfig.state}
              rules: [
                ${homepageConfig.rules.map((item) => {
                  return `{
                    ruleName: "${item.ruleName}"
                    expression: "${item.expression}"
                    expressionJson: ${item.expressionJson}
                    bindingType: ${item.bindingType}
                    bindHomePageModule:{
                      ${item.bindHomePageModule?.id ? `id:${item.bindHomePageModule?.id}` : ''}
                      module:"${item.bindHomePageModule?.module}"
                      displayName:"${item.bindHomePageModule?.displayName}"
                    },
                    bindHomePageMenu:{
                      ${item.bindHomePageMenu?.id ? `id:${item.bindHomePageMenu?.id}` : ''}
                      name:"${item.bindHomePageMenu?.name}"
                      module:"${item.bindHomePageMenu?.module}"
                      displayName:"${item.bindHomePageMenu?.displayName}"
                    },
                    bindHomePageModel:{
                      ${item.bindHomePageModel?.id ? `id:${item.bindHomePageModel?.id}` : ''}
                      model:"${item.bindHomePageModel?.model}"
                      displayName:"${item.bindHomePageModel?.displayName}"
                    },
                    bindHomePageView:{
                      ${item.bindHomePageView?.id ? `id:${item.bindHomePageView?.id}` : ''}
                      model:"${item.bindHomePageView?.model}"
                      name:"${item.bindHomePageView?.name}"
                      title:"${item.bindHomePageView?.title}"
                    },
                    enabled:${item.enabled}
                    code:"${item.code ?? ''}"
                  }`;
                })}
              ]
            }
          }
        }){
          code
        }
      }
    }
    `;

    const result = (await http.query(moduleName, body)) as any;
    return result.data.globalAppConfigProxyMutation.saveAdvancedHomePage;
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function queryHomepageConfig() {
  const rst = await http.mutate(
    'base',
    `{
      globalAppConfigProxyQuery {
        construct(data: {}) {
          id
          code
          extend
        }
      }
    }
    `,
    {}
  );

  const advancedHomePageConfig = (rst.data.globalAppConfigProxyQuery.construct?.extend as any)
    ?.advancedHomePageConfig as HomePageConfig;
  if (advancedHomePageConfig) {
    advancedHomePageConfig.rules?.forEach((rule) => {
      rule.expressionJson = JSON.stringify(rule.expressionJson);
    });
    return advancedHomePageConfig;
  }
  return undefined;
}
