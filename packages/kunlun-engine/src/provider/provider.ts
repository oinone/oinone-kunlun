import { PluginsLoader, PluginsLoaderConfig, RuntimeConfig } from '@kunlun/meta';
import { HttpClient } from '@kunlun/request';
import { blockingSerialExecutor, instantiate, isMobile, MatrixRouteHelper } from '@kunlun/shared';
import { DefaultThemeName, genCSSVars, initOioComponentTheme, ThemeName, ThemeSize } from '@kunlun/theme';
import { RuntimeContextManager } from '../runtime-context/runtime-context-manager';
import { genStaticPath } from '../util/resources';
import { MultiTabsRuntimeManifestMergedConfigManager, MultiTabTheme } from '../view';
import { FrameworkInitializeSPI } from './FrameworkInitializeSPI';
import {
  getMajorConfig,
  getSystemMajorConfig,
  refreshSystemMajorConfig as refreshSystemMajorConfig0,
  setSystemMajorConfig
} from './major';
import {
  OioHttpConfig,
  OioLoginThemeConfig,
  OioLoginThemeName,
  OioProviderBrowserProps,
  OioProviderProps,
  SideBarTheme,
  SideBarThemeColor
} from './typing';

/* ******************************* 变量声明 start  ********************************************* */

const defaultLoginTheme = {
  name: OioLoginThemeName.STAND_RIGHT,
  get backgroundImage() {
    return genStaticPath('login_bg_left.jpg');
  }
};

/**
 * 默认配置
 */
const defaultProviderConfig: Partial<OioProviderProps> = {
  language: 'zh-CN',
  enableI18n: true,
  enableLowNoIntegration: true,
  enableScrollToErrorField: true,
  http: {
    url: window.location.origin,
    enableTranslate: true,
    encodeRsql: false
  },
  framework: 'vue',
  router: [],
  loginTheme: {
    name: OioLoginThemeName.STAND_RIGHT
  },
  theme: [],
  sideBarTheme: {
    mode: SideBarThemeColor.default,
    theme: SideBarTheme.side1
  },
  multiTabTheme: {
    inline: false,
    theme: MultiTabTheme.tab1
  },
  extend: {
    translationManage: false,
    toolboxTranslation: false
  }
};

export const frameworkFactory = new Map();

let initializeTheme = [] as any;

/* ******************************* 变量声明 end  ********************************************* */

// 获取当前主题
export const getCurrentTheme = () => defaultProviderConfig.theme!;

// 获取当前主题大小
export const getCurrentThemeSize = (): ThemeSize | undefined => {
  const defaultTheme = getCurrentTheme();
  if (defaultTheme.includes(DefaultThemeName.DARK_LARGE) || defaultTheme.includes(DefaultThemeName.DEFAULT_LARGE)) {
    return 'large';
  }

  if (defaultTheme.includes(DefaultThemeName.DARK_MEDIUM) || defaultTheme.includes(DefaultThemeName.DEFAULT_MEDIUM)) {
    return 'medium';
  }

  if (defaultTheme.includes(DefaultThemeName.DARK_SMALL) || defaultTheme.includes(DefaultThemeName.DEFAULT_SMALL)) {
    return 'small';
  }

  return undefined;
};

export const getLoginTheme = () => defaultProviderConfig.loginTheme;

export const getCopyrightStatus = () => defaultProviderConfig.copyrightStatus;

export const getDefaultBrowser = () => defaultProviderConfig.browser;

export const getI18nStatus = () => !!defaultProviderConfig.enableI18n;

/**
 * 刷新系统配置
 *  内部会修改主题
 */
async function refreshSystemMajorConfig() {
  const systemMajorConfig = await refreshSystemMajorConfig0();
  MultiTabsRuntimeManifestMergedConfigManager.refreshConfig(systemMajorConfig);

  const { mode, size, extend } = systemMajorConfig;
  const _mode = (mode || 'default').toLocaleLowerCase();
  const _size = (size || 'medium').toLocaleLowerCase();
  // 修改主题
  await OioProvider.setTheme([`${_mode}-${_size}`], false);
  defaultProviderConfig.extend = extend;
  return systemMajorConfig;
}

/* ******************************* 构造函数原型链方法 start  ********************************************* */

function getConfig() {
  return defaultProviderConfig;
}

/**
 *  设置登录页主题
 */
function setLoginTheme(config: OioLoginThemeConfig) {
  defaultProviderConfig.loginTheme = {
    ...defaultProviderConfig.loginTheme,
    ...config
  };
}

/**
 *  创建http
 */
function createHttp(config: OioHttpConfig) {
  const { url, encodeRsql, enableTranslate, interceptor, middleware } = config;

  const http = HttpClient.getInstance();

  http.setBaseURL(url);
  http.setEncodeRsql(encodeRsql);
  http.setEnableTranslate(enableTranslate);

  http.setDefaultMiddleware(interceptor || {});

  const finalMiddleware = middleware || [];
  http.setMiddleware(Array.isArray(finalMiddleware) ? finalMiddleware : [finalMiddleware]);
}

async function createFrameworkInstance(props) {
  const app = frameworkFactory.get(props.framework)();
  if (props.install) {
    await props.install(app);
  }
  RuntimeContextManager.createOrReplace().frameworkInstance = app;
  return app;
}

/**
 *  创建路由
 */
function createRouter(routes) {
  RuntimeContextManager.createOrReplace().routers = routes;
}

async function createCache() {
  // const db = createOioDB();
  // await db.connectDB([
  //   {
  //     name: 'model',
  //     config: { keyPath: 'model' },
  //     columns: ['id', 'model', 'displayName', 'modelFields']
  //   }
  // ]);
}

/**
 *  修改主题
 */
async function setTheme(theme: ThemeName[], force = true) {
  let currentTheme = force ? [...initializeTheme, ...theme] : [...theme, ...initializeTheme];

  /*
   *
   *  开始值： ['dark-small', 'default-medium', 'dark-small']
   *  转换后的值： ['default-medium', 'dark-small']
   */

  currentTheme = currentTheme.filter((value, index) => currentTheme.lastIndexOf(value) === index);

  defaultProviderConfig.theme = currentTheme;

  await genCSSVars(defaultProviderConfig.theme);
}

let faviconIcoLink;

/**
 *  设置浏览器配置
 */
async function setBrowserConfig(browser?: OioProviderBrowserProps) {
  const { title, favicon } = browser || {};
  const { browserTitle, favicon: f } = getSystemMajorConfig() || {};
  document.title = title || browserTitle || document.title;
  const iconHref = favicon || f;
  if (iconHref) {
    if (!faviconIcoLink) {
      faviconIcoLink = document.createElement('link');
      document.head.append(faviconIcoLink);
    }
    faviconIcoLink.href = iconHref || faviconIcoLink.href;
    faviconIcoLink.rel = 'icon';
  }
}

OioProvider.getConfig = getConfig;
OioProvider.setLoginTheme = setLoginTheme;
OioProvider.setTheme = setTheme;
OioProvider.createFrameworkInstance = createFrameworkInstance;
OioProvider.createRouter = createRouter;
OioProvider.setBrowserConfig = setBrowserConfig;
OioProvider.createCache = createCache;
OioProvider.createHttp = createHttp;
OioProvider.refreshSystemMajorConfig = refreshSystemMajorConfig;

/* ******************************* 构造函数原型链方法 end  ********************************************* */

export async function OioProvider(
  oioProps?: Partial<OioProviderProps>,
  callback?: Function[],
  initSystemConfig = true
): Promise<void> {
  Object.assign(defaultProviderConfig, {
    ...oioProps,
    http: { ...defaultProviderConfig.http, ...oioProps?.http },
    loginTheme: { ...defaultProviderConfig.loginTheme, ...oioProps?.loginTheme }
  } as OioProviderProps);
  const props = defaultProviderConfig as OioProviderProps;

  initializeTheme = props.theme;

  MatrixRouteHelper.toggleUrlEncryption(props.encryptionUrlParams);

  // 初始化运行时配置
  const { enableLowNoIntegration } = props;
  let runtimeConfig: Record<string, unknown> | undefined;
  if (enableLowNoIntegration != null) {
    // fixme @zbh 20250117 兼容原有逻辑 6.0移除
    if (enableLowNoIntegration) {
      await RuntimeConfig.init();
      runtimeConfig = RuntimeConfig.get();
    }
  } else if (props.enableRuntimeConfig !== false) {
    await RuntimeConfig.init();
    runtimeConfig = RuntimeConfig.get();
  }

  const initializeServices = FrameworkInitializeSPI.Selector({
    framework: props.framework,
    isMobile: !!isMobile.phone
  }).map(instantiate);

  await blockingSerialExecutor(initializeServices, (service) => service.before?.(props));

  // 创建http
  if (props.enableI18n !== true) {
    props.http.enableTranslate = false;
  }
  OioProvider.createHttp(props.http);

  // 初始化低无一体依赖项
  const plugins = runtimeConfig?.plugins as PluginsLoaderConfig;
  if (plugins) {
    await PluginsLoader.load(plugins, props.dependencies);
  }

  let systemMajorConfig = getSystemMajorConfig();

  // 获取系统配置
  if (initSystemConfig) {
    systemMajorConfig = await getMajorConfig();
    setSystemMajorConfig(systemMajorConfig);
  }
  const { loginBackground, loginPageLogo, loginLayoutType, mode, size, favicon, extend } = systemMajorConfig || {};

  if (extend) {
    defaultProviderConfig.extend = defaultProviderConfig.extend ?? {};
    defaultProviderConfig.extend.toolboxTranslation = extend.toolboxTranslation ?? false;
    defaultProviderConfig.extend.translationManage = extend.translationManage ?? false;
  }

  // 修改版权信息是否展示
  if (typeof props.copyrightStatus === 'boolean') {
    defaultProviderConfig.copyrightStatus = props.copyrightStatus;
  } else if (systemMajorConfig?.partnerName) {
    defaultProviderConfig.copyrightStatus = true;
  }

  if (props.appSwitcher) {
    if (props.appSwitcher.logo) {
      systemMajorConfig.logo = props.appSwitcher.logo;
    }

    if (props.appSwitcher.appSideLogo) {
      systemMajorConfig.appSideLogo = props.appSwitcher.appSideLogo;
    }
  }

  // 修改登录页主题
  const loginTheme = {
    name: loginLayoutType || defaultLoginTheme.name,
    backgroundImage: loginBackground || defaultLoginTheme.backgroundImage
  } as OioLoginThemeConfig;

  if (loginPageLogo) {
    loginTheme.logo = loginPageLogo;
  }

  const propsLoginTheme = oioProps?.loginTheme || {};

  /**
   * 如果前端代码配置了登录页主题，就用前端配置的
   */
  const { length } = Object.keys(propsLoginTheme);
  if (length) {
    Object.entries(propsLoginTheme).forEach(([k, v]) => {
      loginTheme[k] = v;
    });

    // 如果项目中配置的登录页图片是个空字符串，那么不需要展示图片, 给个不存在的图片地址就行
    if (loginTheme.backgroundImage === '') {
      loginTheme.backgroundImage = 'null';
    }
  }

  OioProvider.setLoginTheme(loginTheme);

  const _mode = (mode || 'default').toLocaleLowerCase();
  const _size = (size || 'medium').toLocaleLowerCase();

  // 初始化主题变量
  initOioComponentTheme({
    sideBarTheme: systemMajorConfig.sideBarTheme as any
  });

  // 切换对应的主题
  await OioProvider.setTheme([`${_mode}-${_size}`], false);

  // 创建路由
  await OioProvider.createRouter(props.router);

  await OioProvider.createFrameworkInstance(props);

  // 缓存
  await OioProvider.createCache();

  // 修改浏览器配置
  const browser = props?.browser || ({} as any);
  if (favicon) {
    browser.favicon = favicon;
  }

  defaultProviderConfig.browser = browser;
  await OioProvider.setBrowserConfig(browser);

  if (callback && Array.isArray(callback)) {
    await Promise.allSettled(callback.map((f) => f.call(props)));
  }

  await blockingSerialExecutor(initializeServices, (service) => service.after?.(props));
}
