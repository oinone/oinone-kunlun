import { http } from '@kunlun/service';

const getWorkbenchInfo = async () => {
  const body = `mutation {
      workBenchHomePageMutation {
        queryHomePage(data: {}) {
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

export { getWorkbenchInfo };
