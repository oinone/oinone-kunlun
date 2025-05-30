import { SYSTEM_MODULE_NAME } from '@kunlun/meta';
import { gql } from '@kunlun/request';
import { http } from '@kunlun/service';
import { Subject } from '@kunlun/state';
import { ClearCache } from '../cache';
import {
  DEFAULT_APP_SIDE_LOGO,
  DEFAULT_APP_SWITCH_LOGO,
  DEFAULT_FAVICON,
  DEFAULT_LOGIN_LOGO
} from '../constant/defaultLogo';
import { MajorConfig } from './typing';

const initBasicConfig = async () => {
  const res = await http.mutate(
    SYSTEM_MODULE_NAME.BASE,
    gql`
      {
        appConfigQuery {
          queryListByWrapper(queryWrapper: { rsql: "1==1" }) {
            id
            browserTitle
            scope
            code
            app
            logo
            smallLogo
            partnerName
            officialWebsite
            slogan
            icpDesc
            appSideLogo
            favicon
            browserTitle
            loginPageLogo
            loginBackground
            loginLayoutType
            mode
            size
            sideBarTheme {
              mode
              theme
            }
            multiTabTheme {
              inline
              theme
            }
            extend
          }
        }
      }
    `
  );

  let data = (res.data.appConfigQuery.queryListByWrapper || []) as unknown as any[];

  if (data && data.length) {
    // 将logo拷贝一份给 `loginPageLogo`, 用来兼容老的代码逻辑
    data = data.map((v) => ({
      ...v,
      loginPageLogo: v.loginPageLogo,
      browserIcon: v.favicon
    }));

    return JSON.stringify(data);
  }

  return '[]';
};

export const getBasicConfigByKey = async (key: string) => {
  try {
    const config = await getMajorConfig();
    if (!config) {
      return null;
    }

    return config[key];
  } catch (e) {
    throw new Error(e as string);
  }
};

let majorConfigCache: Promise<MajorConfig> | undefined;

/**
 * 获取登录页的config
 */
export const getMajorConfig = async (
  type: 'login' | 'appSwitch' = 'login',
  defaultConfig?: MajorConfig
): Promise<MajorConfig> => {
  try {
    const config = await initBasicConfig();
    const res = JSON.parse(config).find((d) => d.scope === 'GLOBAL');
    return setDefaultMajorConfig({ ...res, ...defaultConfig } as MajorConfig, type);
  } catch (e) {
    console.error(e);
  }
  return majorConfigCache!;
};

/**
 * 获取登录页以及应用的config
 */
export const getAllMajorConfig = async (): Promise<MajorConfig[]> => {
  try {
    const config = await initBasicConfig();

    return JSON.parse(config).map((c) => setDefaultMajorConfig(c, 'appSwitch'));
  } catch (e) {
    console.error(e);
  }
  return [setDefaultMajorConfig({} as MajorConfig, 'appSwitch')];
};

/**
 * 根据模块编码，获取对应的config
 * @param  {string} moduleModule 模型编码
 */
export const getMajorConfigByModuleModule = async (moduleModule: string) => {
  return systemMajorConfig;

  // const configs = await getAllMajorConfig();

  // const moduleConfigs = configs.filter((c) => c.scope === 'APP');
  // const res = moduleConfigs.find((c) => c.app === moduleModule);

  // if (res) {
  //   return res;
  // }

  // /**
  //  * 如果找不到，就取登录页的配置
  //  */
  // const appSwitchRes = configs.find((d) => d.scope === 'GLOBAL');

  // return appSwitchRes || ({} as MajorConfig);
};

export const setDefaultMajorConfig = (majorConfig: MajorConfig, type: 'login' | 'appSwitch' = 'login') => {
  majorConfig = !majorConfig ? ({} as MajorConfig) : majorConfig;
  if (!majorConfig.appSideLogo) {
    majorConfig.appSideLogo = DEFAULT_APP_SIDE_LOGO();
  }
  if (!majorConfig.loginPageLogo) {
    majorConfig.loginPageLogo = type === 'login' ? DEFAULT_LOGIN_LOGO() : DEFAULT_APP_SWITCH_LOGO();
  }
  // if (!majorConfig.tenantLogo) {
  //   majorConfig.tenantLogo = DEFAULT_BRAND_LOGO;
  // }
  // if (!majorConfig.defaultAppLogo) {
  //   majorConfig.defaultAppLogo = DEFAULT_APP_LOGO;
  // }
  if (!majorConfig.logo) {
    majorConfig.logo = DEFAULT_APP_SWITCH_LOGO();
  }
  if (!majorConfig.favicon) {
    majorConfig.favicon = DEFAULT_FAVICON();
  }
  if (!majorConfig.browserTitle) {
    majorConfig.browserTitle = 'Oinone - 构你想象!';
  }
  return majorConfig;
};

/**
 * 系统配置
 * @deprecated please using
 */
export let systemMajorConfig: MajorConfig = {} as any;

export const $systemMajorConfig = new Subject<MajorConfig>();

export function getSystemMajorConfig() {
  return systemMajorConfig;
}

export function setSystemMajorConfig(majorConfig: MajorConfig) {
  systemMajorConfig = majorConfig;
}

export async function refreshSystemMajorConfig() {
  systemMajorConfig = await getMajorConfig();
  $systemMajorConfig.next(systemMajorConfig);
  return systemMajorConfig;
}

ClearCache.register(() => {
  majorConfigCache = undefined;
});
