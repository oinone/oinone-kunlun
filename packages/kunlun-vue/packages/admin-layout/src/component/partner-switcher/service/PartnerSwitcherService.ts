import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { PartnerInfo, PartnerItem } from '../typing';

/**
 * 合作伙伴选择服务
 */
export interface PartnerSwitcherService {
  /**
   * 查询合作伙伴信息
   */
  queryPartnerInfo(): Promise<PartnerInfo | undefined>;

  /**
   * 选择合作伙伴
   * @param target
   */
  changePartner(target: PartnerItem): Promise<PartnerInfo | undefined>;
}

export const PartnerSwitcherServiceToken = ServiceIdentifier<PartnerSwitcherService>('PartnerSwitcherService');
