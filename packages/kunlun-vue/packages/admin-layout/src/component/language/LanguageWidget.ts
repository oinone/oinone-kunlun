import { ClearCache, CurrentLanguage, ReloadMaskCallChainingParameters } from '@oinone/kunlun-engine';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { SPI } from '@oinone/kunlun-spi';
import { useRouter } from '@oinone/kunlun-vue-router';
import { Widget } from '@oinone/kunlun-vue-widget';
import { EN_US_CODE, RuntimeLanguage, ZH_CN_CODE } from '@oinone/kunlun-vue-ui-common';
import { MaskWidget } from '../../basic';
import { TopBarService } from '../../service';
import DefaultLanguage from './DefaultLanguage.vue';

// 语言切换功能允许用户在不同的语言间进行快速切换，默认使用LanguageWidget.ts作为该功能的基类
@SPI.ClassFactory(MaskWidget.Token({ widget: 'language' }))
export class LanguageWidget extends MaskWidget {
  protected router!: Router;

  protected matched!: Matched;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultLanguage);
    return this;
  }

  @Widget.Reactive()
  protected languages: RuntimeLanguage[] | undefined;

  @Widget.Reactive()
  protected currentLanguage: RuntimeLanguage | undefined;

  @Widget.Method()
  protected onChange(value: RuntimeLanguage) {
    this.currentLanguage = value;
    TopBarService.activeLang(value.id).then(() => {
      ClearCache.clear();
      window.location.reload();
    });
  }

  protected async initLanguages(): Promise<void> {
    if (!this.languages) {
      const languages = await TopBarService.queryLanguageList();
      this.languages = languages.map((v) => {
        if (!v.icon) {
          if (v.code === EN_US_CODE) {
            v.icon = 'oinone-yingguo';
          } else {
            v.icon = 'oinone-zhongguo';
          }
        }
        return v;
      });
    }
  }

  protected initCurrentLanguage(code: string) {
    if (!this.currentLanguage || this.currentLanguage.code !== code) {
      this.currentLanguage = this.languages!.find((v) => v.code === code);
    }
  }

  protected reloadMaskProcess(reloadParameters: ReloadMaskCallChainingParameters) {
    return this.initLanguages().then(async () => {
      this.initCurrentLanguage(await CurrentLanguage.getCode());
    });
  }

  protected $$mounted() {
    super.$$mounted();
    this.router = useRouter().router;
    this.matched = useMatched().matched;
  }
}
