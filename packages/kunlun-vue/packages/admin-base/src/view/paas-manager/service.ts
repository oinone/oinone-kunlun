import { HttpClient } from '@kunlun/request';

const http = HttpClient.getInstance();

const getPaaSModules = async () => {
  const query = `query{
    middlewareConsoleQuery{
      queryPageForCard(
        page:{
          currentPage: 1,
          size: 10000
        }
        queryWrapper:{
          rsql: "(installStatus == INSTALL_SUCC or installStatus == UPDATE_SUCC)"
        }
      ){
        content{
          categoryDisplayName
          middlewareConsoleList{
            icon
            displayName
            ip
            id
            port{port}
            version
            webUrl
            viewActionName
          }
        }
      }
    }
  }`;
  const result = await http.query('paas', query);
  return result.data['middlewareConsoleQuery']['queryPageForCard']['content'] as any;
};

export { getPaaSModules };
