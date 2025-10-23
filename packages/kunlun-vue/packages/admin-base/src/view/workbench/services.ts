import { http } from '@oinone/kunlun-service';

const getApps = async () => {
  const body = `{
  appSwitcherModuleProxyQuery {
    queryPage(page: { currentPage: 1, size: -1 }, queryWrapper: {}) {
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
        urlHomePage {
          target
          url
        }
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
