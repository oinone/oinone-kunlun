import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { MaskWidget } from '../../basic';
import PartnerSwitcher from './PartnerSwitcher.vue';
import { type PartnerSwitcherService, PartnerSwitcherServiceToken } from './service';
import { type PartnerInfoSession, PartnerInfoSessionToken, type PartnerSessionStore } from './session';
import type { PartnerInfo, PartnerItem } from './typing';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'partner-switcher' }))
export class PartnerSwitcherWidget extends MaskWidget {
  protected partnerSwitcherService!: PartnerSwitcherService;

  protected partnerInfoSession!: PartnerInfoSession<PartnerSessionStore>;

  public constructor(handle: string) {
    super(handle);
    this.partnerSwitcherService = SPI.RawInstantiate(PartnerSwitcherServiceToken)!;
    this.partnerInfoSession = SPI.RawInstantiate(PartnerInfoSessionToken) as PartnerInfoSession<PartnerSessionStore>;
  }

  @Widget.Reactive()
  protected currentPartner: PartnerItem | undefined;

  @Widget.Reactive()
  protected partnerList: PartnerItem[] | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(PartnerSwitcher);
    return this;
  }

  @Widget.Method()
  public async onChangePartner(item: PartnerItem) {
    if (item.id && item.id === this.currentPartner?.id) {
      return;
    }
    const partnerInfo = await this.partnerSwitcherService?.changePartner(item);
    this.reloadPartnerInfo(partnerInfo);
    // 组织上下文变更后刷新页面，确保业务数据按新主体重新加载
    if (partnerInfo?.currentPartner?.id) {
      window.location.reload();
    }
  }

  protected reloadPartnerInfo(target: PartnerInfo | undefined, predict?: (target: PartnerInfo) => boolean) {
    if (!target) {
      this.partnerInfoSession?.clear();
      return;
    }
    const { currentPartner, partnerList } = target;
    const currentPartnerId = currentPartner?.id;
    if (!currentPartnerId) {
      this.partnerInfoSession?.clear();
      return;
    }
    if (!predict || predict(target)) {
      this.currentPartner = currentPartner;
      this.partnerList = partnerList || [];
      this.partnerInfoSession?.setPartnerInfo(target);
    }
  }

  protected async mounted() {
    const partnerInfo = await this.partnerSwitcherService?.queryPartnerInfo();
    this.reloadPartnerInfo(partnerInfo, (target) => {
      const currentPartnerId = target.currentPartner.id;
      const store = this.partnerInfoSession?.getCurrentPartnerStore();
      if (store && (store.sid !== currentPartnerId || store.lid !== currentPartnerId)) {
        window.location.href = '/';
        this.partnerInfoSession?.setPartnerInfo(target);
        return false;
      }
      return true;
    });
  }
}
