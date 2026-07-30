import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { GQL } from '@oinone/kunlun-request';
import { SPI } from '@oinone/kunlun-spi';
import { type PartnerInfoSession, PartnerInfoSessionToken, type PartnerSessionStore } from '../../session';
import type { PartnerInfo, PartnerItem } from '../../typing';
import { type PartnerSwitcherService, PartnerSwitcherServiceToken } from '../PartnerSwitcherService';

const BUSINESS_SUBJECT_SWITCHER_MODEL = 'businessSubjectSwitcher';

export type QueryBusinessSubjectSwitcherResult = {
  current: { partnerId: string; code: string; name: string };
  switchList: { partnerId: string; code: string; name: string }[];
};

@SPI.Service(PartnerSwitcherServiceToken)
export class PartnerSwitcherServiceImpl implements PartnerSwitcherService {
  protected partnerInfoSession = SPI.RawInstantiate(PartnerInfoSessionToken) as PartnerInfoSession<PartnerSessionStore>;

  public async queryPartnerInfo(): Promise<PartnerInfo | undefined> {
    const cached = this.getCachedPartner();
    return GQL.query(BUSINESS_SUBJECT_SWITCHER_MODEL, 'querySwitchList')
      .buildRequest((builder) => {
        builder.buildObjectParameter('data', (builder) => {
          builder.stringParameter('scope', 'company');
          if (cached?.id || cached?.code) {
            builder.buildObjectParameter('current', (builder) => {
              if (cached.id) {
                builder.stringParameter('partnerId', cached.id);
              }
              if (cached.code) {
                builder.stringParameter('code', cached.code);
              }
            });
          }
        });
      })
      .buildResponse((builder) =>
        builder.parameter(['current', ['partnerId', 'code', 'name']], ['switchList', ['partnerId', 'code', 'name']])
      )
      .request<QueryBusinessSubjectSwitcherResult>(SYSTEM_MODULE_NAME.COMMON)
      .then((data) => this.convert(data));
  }

  protected getCachedPartner(): { id?: string; code?: string } | undefined {
    const store = this.partnerInfoSession?.getCurrentPartnerStore();
    if (!store) {
      return undefined;
    }
    const id = store.sid || store.lid || undefined;
    const code = store.scode || store.lcode || undefined;
    if (!id && !code) {
      return undefined;
    }
    return { id, code };
  }

  public async changePartner(target: PartnerItem): Promise<PartnerInfo | undefined> {
    return GQL.mutation(BUSINESS_SUBJECT_SWITCHER_MODEL, 'togglePartner')
      .buildRequest((builder) => {
        builder.buildObjectParameter('data', (builder) => {
          builder.stringParameter('scope', 'company');
          builder.buildObjectParameter('current', (builder) => {
            builder.stringParameter('partnerId', target.id);
            builder.stringParameter('code', target.code || target.id);
            builder.stringParameter('name', target.name);
          });
        });
      })
      .buildResponse((builder) =>
        builder.parameter(['current', ['partnerId', 'code', 'name']], ['switchList', ['partnerId', 'code', 'name']])
      )
      .request<QueryBusinessSubjectSwitcherResult>(SYSTEM_MODULE_NAME.COMMON)
      .then((data) => this.convert(data));
  }

  protected convert(data: QueryBusinessSubjectSwitcherResult): PartnerInfo | undefined {
    const { current, switchList } = data || ({} as QueryBusinessSubjectSwitcherResult);
    const partnerList =
      switchList?.map((v) => ({
        id: v.partnerId || v.code,
        code: v.code,
        name: v.name
      })) || [];
    const currentId = current?.partnerId || current?.code;
    const matched = currentId
      ? partnerList.find((v) => v.id === currentId || v.code === currentId || v.code === current?.code)
      : undefined;
    const currentPartner =
      matched ||
      (currentId ? { id: currentId, code: current?.code || currentId, name: current?.name || '' } : partnerList[0]);
    if (currentPartner?.id) {
      return {
        currentPartner,
        partnerList
      };
    }
  }
}
