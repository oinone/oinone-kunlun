import { HttpClient } from '@oinone/kunlun-request';

const http = HttpClient.getInstance();

const getInstallPaaSModules = async (actionId: string) => {
  // fixme @zbh 20221125 改版
  // const action = Action.getActionById(actionId) as IViewAction;
  //
  // if (!action) {
  //   console.error('not find actionId in query page for card ');
  // }

  // rsql: "${action.domain || ''}"
  const query = `query{
  middlewareAppForCardQuery{
   queryPageForCard(
      page:{
        currentPage: 1,
        size: 10000
      } queryWrapper:{}){
       content{
          categoryDisplayName
          middlewareAppForCardList{
            icon
            appName
            appDesc
            appCode
          }
        }
      }
    }
  }`;
  const result = await http.query('paas', query);
  return result.data['middlewareAppForCardQuery']['queryPageForCard']['content'] as any;
};

export { getInstallPaaSModules };
