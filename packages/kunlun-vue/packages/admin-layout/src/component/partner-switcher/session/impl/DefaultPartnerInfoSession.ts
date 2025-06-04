import { SPI } from '@oinone/kunlun-spi';
import { PartnerInfo, PartnerItem } from '../../typing';
import { PartnerInfoSession, PartnerInfoSessionToken } from '../PartnerInfoSession';

export interface PartnerSessionStore {
  sid: string | null | undefined;
  lid: string | null | undefined;
}

@SPI.Service(PartnerInfoSessionToken)
export class DefaultPartnerInfoSession implements PartnerInfoSession<PartnerSessionStore> {
  private static readonly CACHE_KEY = 'pamirs_partner_id';

  private partnerInfo: PartnerInfo | undefined;

  public getCurrentPartner(): PartnerItem | undefined {
    return this.getPartnerInfo()?.currentPartner;
  }

  public getPartnerInfo(): PartnerInfo | undefined {
    return this.partnerInfo;
  }

  public setPartnerInfo(target: PartnerInfo | undefined): void {
    if (target) {
      sessionStorage.setItem(DefaultPartnerInfoSession.CACHE_KEY, target.currentPartner.id);
      localStorage.setItem(DefaultPartnerInfoSession.CACHE_KEY, target.currentPartner.id);
    } else {
      this.clear();
    }
  }

  public getCurrentPartnerStore(): PartnerSessionStore | undefined {
    const sid = sessionStorage.getItem(DefaultPartnerInfoSession.CACHE_KEY);
    const lid = localStorage.getItem(DefaultPartnerInfoSession.CACHE_KEY);
    if (sid || lid) {
      return { sid, lid };
    }
    return undefined;
  }

  public clear(): void {
    sessionStorage.removeItem(DefaultPartnerInfoSession.CACHE_KEY);
    localStorage.removeItem(DefaultPartnerInfoSession.CACHE_KEY);
  }
}
