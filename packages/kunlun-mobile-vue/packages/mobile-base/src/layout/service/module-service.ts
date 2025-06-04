import { QueryPageResult, RuntimeViewAction } from '@oinone/kunlun-engine';
import { IModule, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { gql } from '@oinone/kunlun-request';
import { http } from '@oinone/kunlun-service';

export class ModuleService {
  public static async queryApplications(): Promise<IModule[]> {
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
    return res.data.appSwitcherModuleProxyQuery.queryPage.content.sort(
      (a, b) => Number(a.priority) - Number(b.priority)
    );
  }

  public static generatorViewTitle(action: RuntimeViewAction): string {
    const { resView } = action;
    return action.title || resView?.title || resView?.name || '未命名';
  }
}
