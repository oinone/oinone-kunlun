import { SPI } from '@oinone/kunlun-spi';
import type { PartnerInfo, PartnerItem } from '../../typing';
import { type PartnerInfoSession, PartnerInfoSessionToken } from '../PartnerInfoSession';

export interface PartnerSessionStore {
  sid: string | null | undefined;
  lid: string | null | undefined;
  scode: string | null | undefined;
  lcode: string | null | undefined;
}

@SPI.Service(PartnerInfoSessionToken)
export class DefaultPartnerInfoSession implements PartnerInfoSession<PartnerSessionStore> {
  private static readonly CACHE_KEY = 'pamirs_partner_id';

  private static readonly CACHE_CODE_KEY = 'pamirs_partner_code';

  private partnerInfo: PartnerInfo | undefined;

  public getCurrentPartner(): PartnerItem | undefined {
    return this.getPartnerInfo()?.currentPartner;
  }

  public getPartnerInfo(): PartnerInfo | undefined {
    return this.partnerInfo;
  }

  public setPartnerInfo(target: PartnerInfo | undefined): void {
    if (target) {
      this.partnerInfo = target;
      sessionStorage.setItem(DefaultPartnerInfoSession.CACHE_KEY, target.currentPartner.id);
      localStorage.setItem(DefaultPartnerInfoSession.CACHE_KEY, target.currentPartner.id);
      const code = target.currentPartner.code || '';
      sessionStorage.setItem(DefaultPartnerInfoSession.CACHE_CODE_KEY, code);
      localStorage.setItem(DefaultPartnerInfoSession.CACHE_CODE_KEY, code);
    } else {
      this.clear();
    }
  }

  public getCurrentPartnerStore(): PartnerSessionStore | undefined {
    const sid = sessionStorage.getItem(DefaultPartnerInfoSession.CACHE_KEY);
    const lid = localStorage.getItem(DefaultPartnerInfoSession.CACHE_KEY);
    const scode = sessionStorage.getItem(DefaultPartnerInfoSession.CACHE_CODE_KEY);
    const lcode = localStorage.getItem(DefaultPartnerInfoSession.CACHE_CODE_KEY);
    if (sid || lid || scode || lcode) {
      return { sid, lid, scode, lcode };
    }
    return undefined;
  }

  public clear(): void {
    this.partnerInfo = undefined;
    sessionStorage.removeItem(DefaultPartnerInfoSession.CACHE_KEY);
    localStorage.removeItem(DefaultPartnerInfoSession.CACHE_KEY);
    sessionStorage.removeItem(DefaultPartnerInfoSession.CACHE_CODE_KEY);
    localStorage.removeItem(DefaultPartnerInfoSession.CACHE_CODE_KEY);
  }
}
