import { PluginLoadDependencies } from '@kunlun/meta';
import { InterceptorOptions, NetworkMiddlewareHandler } from '@kunlun/request';
import { ThemeName } from '@kunlun/theme';
import { RouterPath } from '../runtime-metadata';
import type { MultiTabsConfig } from '../view';

export interface MajorConfig {
  id: string;
  scope: string;
  code: string;
  app: string;
  logo: string; // 应用logo，未折叠
  appSideLogo: string; // 应用logo，折叠
  smallLogo: string;
  partnerName: string; // 企业名称
  officialWebsite: string; // 企业官网
  slogan: string; // 企业slogan
  icpDesc: string; // 备案号
  favicon: string; // 浏览器logo
  browserTitle: string; // 浏览器标题
  loginPageLogo: string; // 登录页logo
  loginBackground: string; // 登录页背景
  loginLayoutType: any; // 登录页布局主题
  mode: any; // 主题
  size: string; // 主题大小
  // 侧边栏主题
  sideBarTheme?: OioProviderProps['sideBarTheme'];
  // 多tab主题
  multiTabTheme?: OioProviderProps['multiTabTheme'];
  // 翻译项配置
  extend?: ExtendSettingType;
}

/**
 * 浏览器配置
 */
export interface OioProviderBrowserProps {
  /**
   * 浏览器选项卡图标
   */
  favicon?: string;
  /**
   * 浏览器默认标题（仅用于非主页面）
   */
  title?: string;
  /**
   * ?
   */
  links?: string[];
}

/**
 * 内置登录主题名称
 */
export enum OioLoginThemeName {
  /**
   * 大背景居左登录
   */
  LEFT_STICK = 'LEFT_STICK',
  /**
   * 大背景居右登录
   */
  RIGHT_STICK = 'RIGHT_STICK',
  /**
   * 大背景居中登录
   */
  CENTER_STICK = 'CENTER_STICK',
  /**
   * 大背景居中登录,logo在登录页里面
   */
  CENTER_STICK_LOGO = 'CENTER_STICK_LOGO',
  /**
   * 左侧登录
   */
  STAND_LEFT = 'STAND_LEFT',
  /**
   * 右侧登录
   */
  STAND_RIGHT = 'STAND_RIGHT'
}

/**
 * 左侧菜单颜色
 */
export enum SideBarThemeColor {
  // 默认
  default = 'default',
  // 深色
  dark = 'dark'
}

/**
 * 侧边栏主题
 */
export enum SideBarTheme {
  side1 = 'theme1',
  side2 = 'theme2',
  side3 = 'theme3',
  side4 = 'theme4',
  side5 = 'theme5',
  side6 = 'theme6'
}

/**
 * 登录页logo显示位置
 */
export enum OioLoginLogoPosition {
  /**
   * 左侧
   */
  LEFT = 'LEFT',
  /**
   * 右侧
   */
  RIGHT = 'RIGHT',
  /**
   * 中间
   */
  CENTER = 'CENTER'
}

/**
 * 登录主题配置
 */
export interface OioLoginThemeConfig {
  /**
   * 内置登录主题名称
   */
  name?: OioLoginThemeName;
  /**
   * 背景图片 url
   */
  backgroundImage?: string;
  /**
   * 背景色
   */
  backgroundColor?: string;
  /**
   * logo url
   */
  logo?: string;
  /**
   * 登录页logo显示位置
   */
  logoPosition?: OioLoginLogoPosition;
}

/**
 * OioHttp配置
 */
export interface OioHttpConfig {
  /**
   * base url
   */
  url?: string;

  /**
   * 是否编码rsql条件
   * 编码后安全性更高
   */
  encodeRsql?: boolean;

  /**
   * 是否翻译响应结果
   * 后端需要翻译的字符串会用 $(xxxxx) 形式返回
   */
  enableTranslate?: boolean;

  /**
   * 拦截器配置
   */
  interceptor?: Partial<InterceptorOptions>;

  /**
   * 中间件配置（优先于拦截器）
   */
  middleware?: NetworkMiddlewareHandler | NetworkMiddlewareHandler[];
}

export interface TranslateSettingType {
  /**
   * 单项翻译开关
   */
  translationManage?: boolean;

  /**
   * 工具箱开关
   */
  toolboxTranslation?: boolean;

  /**
   * 翻译列表
   */
  resourceTranslations?: {
    moduleName: string;
    remoteUrl: string;
    [key: string]: unknown;
  }[];
}

export interface SideBarThemeConfig {
  mode?: SideBarThemeColor;
  theme?: SideBarTheme;
}

export interface SystemStyleConfig {
  sideBarConfig?: SideBarThemeConfig;
  multiTabConfig?: MultiTabsConfig;
}

export type ExtendSettingType = { systemStyleConfig?: SystemStyleConfig } & TranslateSettingType;

/**
 * OioProvider属性
 */
export interface OioProviderProps {
  /**
   * 当前语言 (暂时无效)
   */
  language: string;
  /**
   * 当前框架
   */
  framework: 'vue' | 'react' | string;

  /**
   * http配置
   */
  http: OioHttpConfig;

  /**
   * 路由配置
   */
  router: RouterPath[];

  /**
   * 缓存配置 (暂时无效)
   */
  cache: {
    db: string;
    tables: any[];
  };

  /**
   * 应用logo
   */
  appSwitcher: {
    logo?: string; // 正常的logo
    appSideLogo?: string; // 缩放后的logo
  };

  /**
   * copyright状态
   */
  copyrightStatus?: boolean;

  /**
   * 登录主题配置
   */
  loginTheme: OioLoginThemeConfig;

  /**
   * 侧边栏菜单主题配置
   */
  sideBarTheme?: SideBarThemeConfig;

  /**
   * 多tab主题配置
   */
  multiTabTheme?: MultiTabsConfig;

  /**
   * 浏览器配置
   */
  browser: OioProviderBrowserProps;

  /**
   * app被mount前触发，可以用来注册全局组件
   */
  install?: ((app) => void) | ((app) => Promise<void>);

  /**
   * 全局主题配置
   */
  theme: ThemeName[];

  /**
   * 低无一体依赖配置
   */
  dependencies: PluginLoadDependencies;

  /**
   * 是否对url参数进行加密
   */
  encryptionUrlParams: boolean;

  /**
   * 开启低无一体
   * 默认开启
   * @deprecated please using enableRuntimeConfig
   */
  enableLowNoIntegration?: boolean;

  /**
   * 启用运行时配置（默认: 启用）
   */
  enableRuntimeConfig?: boolean;

  /**
   * 是否开启国际化
   * 默认开启
   */
  enableI18n?: boolean;

  /**
   * 当表单提交的时候，验证失败的字段会自动定位到视图可视化区域
   * 默认开启
   */
  enableScrollToErrorField?: boolean;

  /**
   * 单项翻译、工具箱开关配置
   * 默认关闭
   */
  extend?: ExtendSettingType;
}
