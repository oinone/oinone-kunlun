import { QueryPageResult } from '@kunlun/engine';
import { SYSTEM_MODULE_NAME } from '@kunlun/meta';
import { gql, HttpClient } from '@kunlun/request';
import { ResourceCountry } from '../../typing';

const http = HttpClient.getInstance();

export class PhoneCodeQueryService {
  public static async fetchPhoneCodeList(): Promise<ResourceCountry[] | undefined> {
    const queryGql = gql`
      {
        resourceCountryQuery {
          queryPhoneCodes {
            id
            code
            name
            phoneCode
          }
        }
      }
    `;
    const result = await http.query<ResourceCountry[]>(SYSTEM_MODULE_NAME.RESOURCE, queryGql);
    return result.data.resourceCountryQuery.queryPhoneCodes;
  }
}
