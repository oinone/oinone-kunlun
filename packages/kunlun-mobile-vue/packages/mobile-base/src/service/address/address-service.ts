import { Pagination } from '@oinone/kunlun-engine';
import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { ObjectValue, RequestContext } from '@oinone/kunlun-request';
import { http, IQueryPageResult } from '@oinone/kunlun-service';
import { GraphqlHelper } from '@oinone/kunlun-shared';
import { ResourceAddress } from '../../typing';

export class AddressService {
  public static async construct(data: ResourceAddress): Promise<ResourceAddress> {
    const gql = `query {
  resourceAddressQuery {
    construct (
      data: {
        ${GraphqlHelper.buildStringGQLParameter('countryCode', data.countryCode)}
        ${GraphqlHelper.buildStringGQLParameter('provinceCode', data.provinceCode)}
        ${GraphqlHelper.buildStringGQLParameter('cityCode', data.cityCode)}
        ${GraphqlHelper.buildStringGQLParameter('districtCode', data.districtCode)}
        ${GraphqlHelper.buildStringGQLParameter('streetCode', data.streetCode)}
      }
    ) {
      id
      countryCode
      originCountry {
        id
        code
        name
      }
      provinceCode
      originProvince {
        id
        code
        name
      }
      cityCode
      originCity {
        id
        code
        name
      }
      districtCode
      originDistrict {
        id
        code
        name
      }
      streetCode
      originStreet {
        id
        code
        name
      }
      street2
      fullAddress
    }
  }
}
`;
    const result = await http.query<ResourceAddress>(SYSTEM_MODULE_NAME.RESOURCE, gql);
    return result.data.resourceAddressQuery.construct;
  }

  public static async queryPage(
    rsql?: string,
    pagination?: Pagination,
    variables?: ObjectValue,
    context?: RequestContext
  ): Promise<IQueryPageResult<ResourceAddress>> {
    const gql = `query {
	resourceAddressQuery {
		queryPage (
			page: {
			  ${GraphqlHelper.buildNotStringGQLParameter('currentPage', pagination?.current)}
			  ${GraphqlHelper.buildNotStringGQLParameter('size', pagination?.pageSize)}
			}
			queryWrapper: { 
			  ${GraphqlHelper.buildStringGQLParameter('rsql', rsql, true)}
			}
		) {
			content {
				id
				countryCode
				originCountry {
					id
					code
					name
				}
				provinceCode
				originProvince {
					id
					code
					name
				}
				cityCode
				originCity {
					id
					code
					name
				}
				districtCode
				originDistrict {
					id
					code
					name
				}
				streetCode
				originStreet {
					id
					code
					name
				}
				street2
				fullAddress
			}
			size
			totalPages
			totalElements
		}
	}
}
`;
    const result = await http.query<IQueryPageResult<ResourceAddress>>(
      SYSTEM_MODULE_NAME.RESOURCE,
      gql,
      variables,
      context
    );
    return result.data.resourceAddressQuery.queryPage;
  }
}
