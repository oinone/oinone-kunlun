import {
  frameworkFactory,
  FrameworkInitializeService,
  FrameworkInitializeSPI,
  LanguageType,
  OioProvider,
  OioProviderProps,
  registryLanguage,
  RuntimeContextManager
} from '@oinone/kunlun-engine';
import { registerCurrentInstanceGetter } from '@oinone/kunlun-environment';
import { isMobile } from '@oinone/kunlun-shared';
import { SPIFactory } from '@oinone/kunlun-spi';
import { maskInstall } from '@oinone/kunlun-vue-admin-layout';
import { Boot } from '@wangeditor/editor';
import attachmentModule from '@wangeditor/plugin-upload-attachment';
import { App, getCurrentInstance } from 'vue';
import { createApp as CreateVueApp } from './create_app';
import enUs from './locale/en_US';
import zhCn from './locale/zh_CN';
import { DefaultRoot as CreateVueRoute } from './provider';
import { install } from './tags';

@SPIFactory.Register(FrameworkInitializeSPI.Token({ framework: 'vue', isMobile: false, priority: 0 }))
export class VueFrameworkInitializeService implements FrameworkInitializeService {
  public before(props: OioProviderProps) {
    registryLanguage(LanguageType['en-US'], enUs);
    registryLanguage(LanguageType['zh-CN'], zhCn);
    frameworkFactory.set('vue', CreateVueApp);
    frameworkFactory.set('route', CreateVueRoute);

    // wangEditor 默认的 plugins 数量是 13，如果大于 13，证明已经注册过了
    if (Boot.plugins.length <= 13) {
      Boot.registerModule(attachmentModule);
    }
  }

  public after(props: OioProviderProps) {
    maskInstall();
    install();
    const app = RuntimeContextManager.createOrReplace<App>().frameworkInstance;
    app.mount('#app');
  }
}

registerCurrentInstanceGetter({ framework: 'vue' }, () => {
  const app = RuntimeContextManager.createOrReplace<App>().frameworkInstance;
  const instance = getCurrentInstance();
  const el = instance?.vnode?.el as HTMLElement;
  return {
    app: {
      id: `${app?._uid}`
    },
    currentInstance: {
      vNode: {
        el
      }
    }
  };
});

export const VueOioProvider = async (config?: Partial<OioProviderProps>, callback?: Function[]) => {
  if (config) {
    config.framework = 'vue';
  }
  (isMobile as unknown as { phone: boolean }).phone = false;
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
