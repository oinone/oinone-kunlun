import { http } from '@oinone/kunlun-service';
import { ModelCache } from '@oinone/kunlun-engine';

const getApps = async () => {
  const model = await ModelCache.get('apps.AppsManagementModule');
  const bindUrlFieldExist = (model?.modelFields ?? []).filter((it) => it.data === 'urlHomePage').length > 0;

  const body = `{
      appSwitcherModuleProxyQuery {
        queryPage(page: {}, queryWrapper: {}) {
          content {
            module
            like
            logo
            name
            displayName
            homePage {
              module
              model
              name
              resModuleName
              moduleName
              viewType
            }
            ${bindUrlFieldExist ? 'urlHomePage {\ntarget\nurl\n}' : ''}
          }
        }
      }
    }
    `;
  const result = (await http.query('base', body)).data['appSwitcherModuleProxyQuery']['queryPage']['content'];

  return (result as Record<string, unknown>[]).filter((res) => res.like);
};

const getWorkbenchInfo = async () => {
  const body = `mutation {
      workBenchHomePageMutation {
        queryHomePage(data: {}) {
          appsPerm
          activeTaskStatistics {
            tips
            workBenchTaskList {
              num
              icon
              label
              viewAction {
                module
                model
                name
                resModuleName
                moduleName
                viewType
                context
              }
            }
          }
          workStatistics {
            workBenchTaskList {
              num
              icon
              label
              viewAction {
                module
                model
                name
                resModuleName
                moduleName
                viewType
                context
              }
            }
          }
        }
      }
    }
  `;
  const result = (await http.mutate('workbench', body)).data['workBenchHomePageMutation']['queryHomePage'];

  return result;
};

export { getApps, getWorkbenchInfo };
