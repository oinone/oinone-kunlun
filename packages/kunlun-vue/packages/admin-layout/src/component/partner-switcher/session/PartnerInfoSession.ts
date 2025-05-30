import { ServiceIdentifier } from '@kunlun/spi';
import { PartnerInfo, PartnerItem } from '../typing';

export interface PartnerInfoSession<T = unknown> {
  /**
   * 获取当前合作伙伴
   */
  getCurrentPartner(): PartnerItem | undefined;

  /**
   * 获取合作伙伴信息
   */
  getPartnerInfo(): PartnerInfo | undefined;

  /**
   * 设置当前合作伙伴信息
   * @param target 合作伙伴信息
   */
  setPartnerInfo(target: PartnerInfo | undefined): void;

  /**
   * 获取当前合作伙伴存储信息
   */
  getCurrentPartnerStore(): T | undefined;

  /**
   * 清空当前合作伙伴存储信息
   */
  clear(): void;
}

export const PartnerInfoSessionToken = ServiceIdentifier<PartnerInfoSession>('PartnerInfoSession');
