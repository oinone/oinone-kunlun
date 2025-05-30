/**
 * 合作伙伴项
 */
export interface PartnerItem {
  id: string;
  name: string;
}

/**
 * 合作伙伴信息
 */
export interface PartnerInfo {
  /**
   * 当前合作伙伴
   */
  currentPartner: PartnerItem;

  /**
   * 可选合作伙伴列表
   */
  partnerList: PartnerItem[];
}
