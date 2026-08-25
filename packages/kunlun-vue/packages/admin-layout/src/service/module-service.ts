import { ClearCache, QueryPageResult, type RuntimeViewAction, translateValueByKey } from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { type IModule, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { gql } from '@oinone/kunlun-request';
import { http } from '@oinone/kunlun-service';

export class ModuleService {
  public static apps: IModule[] = [];

  /**
   * 查询应用列表
   * @param {boolean} force 强制重新加载应用列表，不走缓存
   * @returns {Promise<IModule[]>} 返回应用列表
   */
  public static async queryApplications(force?: boolean): Promise<IModule[]> {
    if (ModuleService.apps.length && !force) {
      return ModuleService.apps;
    }

    ClearCache.register(() => {
      ModuleService.apps = [];
    });

    const body = gql`
      {
        appSwitcherModuleProxyQuery {
          queryPage(
            page: { currentPage: 1, size: -1, sort: { orders: { field: "priority", direction: ASC } } }
            queryWrapper: {}
          ) {
            content {
              id
              homepageViewId
              homePageModel
              homepageViewSystemSource
              displayName
              name
              logo
              like
              systemSource
              category
              module
              state
              priority
              application
              latestVersion
              platformVersion
              urlHomePage {
                target
                url
              }
            }
            size
            totalPages
            totalElements
          }
        }
      }
    `;
    const res = await http.query<QueryPageResult<IModule>>(SYSTEM_MODULE_NAME.BASE, body, {}, { batch: true });
    // fixme @zbh 20230417 后端排序未生效
    return (ModuleService.apps = res.data.appSwitcherModuleProxyQuery.queryPage.content.sort(
      (a, b) => Number(a.priority) - Number(b.priority)
    ));
  }

  public static generatorViewTitle(action: RuntimeViewAction, parameters?: Record<string, unknown>): string {
    const { resView } = action;
    let title = action.title || resView?.title || resView?.name || translateValueByKey('未命名');
    if (parameters) {
      const expParameters = { ...parameters };
      if (parameters.context && typeof parameters.context === 'string') {
        try {
          expParameters.context = JSON.parse(parameters.context);
        } catch (e) {
          console.warn(`Invalid parameters context. ${parameters.context}`, e);
        }
      }
      const params: ExpressionRunParam = {
        activeRecords: [expParameters],
        rootRecord: expParameters,
        openerRecord: {},
        parentRecord: {},
        scene: action.name
      };
      const computedTitle = Expression.run(params, title, title);
      if (typeof computedTitle === 'string') {
        title = computedTitle;
      }
    }
    return title;
  }
}
