import {
  frameworkFactory,
  FrameworkInitializeService,
  FrameworkInitializeSPI,
  LanguageType,
  OioProvider,
  OioProviderProps,
  registryLanguage,
  RuntimeContextManager
} from '@kunlun/engine';
import { isMobile } from '@kunlun/shared';
import { SPIFactory } from '@kunlun/spi';
import { DefaultThemeName, isSystemTheme } from '@kunlun/theme';
import { Boot } from '@wangeditor/editor';
import attachmentModule from '@wangeditor/plugin-upload-attachment';
import { Locale } from 'vant';
import VantZhCN from 'vant/es/locale/lang/zh-CN';
import { createApp as CreateVueApp } from './create_app';
import { maskInstall } from './layout';
import enUs from './locale/en_US';
import zhCn from './locale/zh_CN';
import { DefaultRoot as CreateVueRoute } from './provider';
import { installMessageHub } from './spi-register';
import { install } from './tags';

@SPIFactory.Register(FrameworkInitializeSPI.Token({ framework: 'vue', isMobile: true, priority: 0 }))
export class VueMobileFrameworkInitializeService implements FrameworkInitializeService {
  public before(props: OioProviderProps) {
    Locale.use('zh-CN', VantZhCN);
    registryLanguage(LanguageType['en-US'], enUs);
    registryLanguage(LanguageType['zh-CN'], zhCn);
    frameworkFactory.set('vue', CreateVueApp);
    frameworkFactory.set('route', CreateVueRoute);

    // 防止在界面设计器中跟pc端重复
    attachmentModule.menus?.forEach((menu) => {
      menu.key = `mobile${menu.key.charAt(0).toUpperCase()}${menu.key.slice(1)}`;
    });

    Boot.registerModule(attachmentModule);
  }

  public after(props: OioProviderProps) {
    maskInstall();
    install();
    installMessageHub();
    const app = RuntimeContextManager.createOrReplace().frameworkInstance as any;
    app.mount('#app');
  }
}

export const VueOioProvider = async (config?: Partial<OioProviderProps>, callback?: Function[]) => {
  if (config) {
    config.framework = 'vue';

    // 移动端只允许使用系统主题中的DEFAULT_MEDIUM+自定义主题的组合方式
    const themes = config?.theme?.filter((a) => !isSystemTheme(a) || a !== DefaultThemeName.DEFAULT_MEDIUM);
    if (themes) {
      config.theme = themes;
    }
  }

  (isMobile as unknown as { phone: boolean }).phone = true;
  await OioProvider(config, callback);
};

function replaceAll(this: string, searchValue, replaceValue) {
  let regExp: RegExp;
  if (typeof searchValue === 'string') {
    regExp = new RegExp(searchValue, 'gm');
  } else {
    regExp = searchValue;
  }
  return this.replace(regExp, replaceValue);
}

if (!String.prototype.replaceAll) {
  // eslint-disable-next-line no-extend-native
  String.prototype.replaceAll = replaceAll;
}
if (!Promise.allSettled) {
  Promise.allSettled = function (promises) {
    const promiseStates = promises.map((p) =>
      Promise.resolve(p).then(
        (value) => ({ state: 'fulfilled', value }),
        (reason) => ({ state: 'rejected', reason })
      )
    );
    return Promise.all(promiseStates);
  };
}
