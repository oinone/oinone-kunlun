import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ExtendSettingType, OioProvider, TranslateSettingType } from '@oinone/kunlun-engine';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { useRouter } from '@oinone/kunlun-vue-router';

import { BaseElementWidget } from '../../../basic';

import TranslateSetting from './TranslateSetting.vue';
import { getTranslateSetting, setTranslateSetting } from '../service';

const defaultSetting = {
  translationManage: false,
  toolboxTranslation: false
};

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'TranslateSettingWidget' }))
export class TranslateSettingWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(TranslateSetting);

    return this;
  }

  @Widget.Reactive()
  private translateConfig: TranslateSettingType | undefined = undefined;

  protected $matched: Matched | undefined;

  protected $router: Router | undefined;

  private currentTranslateId: string | undefined;

  @Widget.Method()
  private async onSaveConfig(index: string, value: boolean) {
    this.translateConfig![index] = value;
    await setTranslateSetting(this.translateConfig);
    OioProvider.refreshSystemMajorConfig();
  }

  private async queryTranslateConfig() {
    const translateConfig = defaultSetting;
    const config = await getTranslateSetting();
    const extend = config?.extend as ExtendSettingType | undefined;
    if (extend?.translationManage) {
      translateConfig.translationManage = extend.translationManage;
    }
    if (extend?.toolboxTranslation) {
      translateConfig.toolboxTranslation = extend.toolboxTranslation;
    }

    this.translateConfig = translateConfig as TranslateSettingType;
    this.currentTranslateId = config?.id as string;
  }

  protected async beforeCreated() {
    this.queryTranslateConfig();
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    if (!this.$matched) {
      const { matched } = useMatched();
      this.$matched = matched;
    }
    if (!this.$router) {
      this.$router = useRouter().router as Router;
    }
  }
}
