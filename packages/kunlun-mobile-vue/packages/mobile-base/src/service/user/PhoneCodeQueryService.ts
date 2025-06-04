import { QueryPageResult } from '@oinone/kunlun-engine';
import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { gql, HttpClient } from '@oinone/kunlun-request';
import { ResourceCountry } from '../../typing';

const http = HttpClient.getInstance();

export class PhoneCodeQueryService {
  public static async fetchPhoneCodeList(): Promise<ResourceCountry[] | undefined> {
    const queryGql = gql`
      {
        resourceCountryQuery {
          queryPage(page: { currentPage: 1, size: -1 }, queryWrapper: { rsql: "phoneCode =isnull= false" }) {
            content {
              id
              code
              name
              phoneCode
            }
          }
        }
      }
    `;
    const result = await http.query<QueryPageResult<ResourceCountry>>(SYSTEM_MODULE_NAME.RESOURCE, queryGql);
    return result.data.resourceCountryQuery.queryPage.content;
  }
}
