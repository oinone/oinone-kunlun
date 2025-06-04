import { HttpClient } from '@oinone/kunlun-request';
import { IQueryPageResult } from '@oinone/kunlun-service';
import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { IFunction } from '../types';

const http = HttpClient.getInstance();

let functionCacheList: IFunction[] = [];

// 内置函数
export async function queryExpBuildInFunction(): Promise<IFunction[]> {
  if (functionCacheList.length > 0) {
    return functionCacheList;
  }
  const body = `
  query{
      functionQuery{
          queryPage(page:{size:200,currentPage:1},queryWrapper:{
              rsql:"isBuiltin == true "
          }) {
              content{
                  fun
                  displayName##显示名称
                  name
                  category
                  argumentList{
                      name
                      multi
                      model
                      ttype
                  }
                  returnType {
                    multi
                    model
                    ttype
                    dictionary
                  }
              }
          }
      }
  }
  `;

  const result = await http.query(SYSTEM_MODULE_NAME.BASE, body);
  const page: IQueryPageResult<any> = JSON.parse(
    JSON.stringify(result.data.functionQuery.queryPage)
  ) as IQueryPageResult<any>;
  functionCacheList = page.content as IFunction[];
  return functionCacheList;
}
