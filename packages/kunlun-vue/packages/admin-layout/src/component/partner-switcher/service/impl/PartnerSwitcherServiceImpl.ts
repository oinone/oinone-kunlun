import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { GQL } from '@oinone/kunlun-request';
import { SPI } from '@oinone/kunlun-spi';
import { PartnerInfo, PartnerItem } from '../../typing';
import { PartnerSwitcherService, PartnerSwitcherServiceToken } from '../PartnerSwitcherService';

const SHOW_PARTNERS_MODEL_NAME = 'showPartners';

export type QueryShowPartnersResult = {
  partner: { code: string; name: string };
  partnerList: { code: string; name: string }[];
};

@SPI.Service(PartnerSwitcherServiceToken)
export class PartnerSwitcherServiceImpl implements PartnerSwitcherService {
  public async queryPartnerInfo(): Promise<PartnerInfo | undefined> {
    return GQL.query(SHOW_PARTNERS_MODEL_NAME, 'queryAllPartners')
      .buildResponse((builder) => builder.parameter(['partner', ['code', 'name']], ['partnerList', ['code', 'name']]))
      .request<QueryShowPartnersResult>(SYSTEM_MODULE_NAME.COMMON)
      .then((data) => this.convert(data));
  }

  public async changePartner(target: PartnerItem): Promise<PartnerInfo | undefined> {
    return GQL.mutation(SHOW_PARTNERS_MODEL_NAME, 'changePartner')
      .buildRequest((builder) => {
        builder.buildObjectParameter('currentPartner', (builder) => {
          builder.stringParameter('code', target.id);
          builder.stringParameter('name', target.name);
        });
      })
      .buildResponse((builder) => builder.parameter(['partner', ['code', 'name']], ['partnerList', ['code', 'name']]))
      .request<QueryShowPartnersResult>(SYSTEM_MODULE_NAME.COMMON)
      .then((data) => this.convert(data));
  }

  protected convert(data: QueryShowPartnersResult): PartnerInfo | undefined {
    const { partner, partnerList } = data;
    if (partner && partner.code) {
      return {
        currentPartner: {
          id: partner.code,
          name: partner.name
        },
        partnerList: partnerList?.map((v) => ({ id: v.code, name: v.name })) || []
      };
    }
  }
}
