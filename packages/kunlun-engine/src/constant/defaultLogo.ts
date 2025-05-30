import { genStaticPath } from '../util/resources';

export const DEFAULT_BRAND_LOGO = () => genStaticPath('default_brand_logo.png');
export const DEFAULT_LOGIN_LOGO = () => genStaticPath('oinone-logo.png');
export const DEFAULT_APP_SWITCH_LOGO = () =>
  genStaticPath('default_app_switch_logo.png?x-oss-process=image/resize,m_lfit,h_800');
export const DEFAULT_APP_LOGO = () => genStaticPath('default_app_logo.png');
export const DEFAULT_FAVICON = () => genStaticPath('default_favicon.ico');
export const DEFAULT_APP_SIDE_LOGO = () =>
  genStaticPath('default_app_side_logo.png?x-oss-process=image/resize,m_lfit,h_800');
