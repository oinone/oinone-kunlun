import { component } from './constant';
import { defaultDangerCSSVars, linkDangerCSSVars, primaryDangerCSSVars } from './danger';
import { defaultInfoCSSVars, linkInfoCSSVars, primaryInfoCSSVars } from './info';
import { defaultCSSVars, linkCSSVars, primaryCSSVars } from './standard';
import { defaultSuccessCSSVars, linkSuccessCSSVars, primarySuccessCSSVars } from './success';
import { defaultWarningCSSVars, linkWarningCSSVars, primaryWarningCSSVars } from './warning';

export const cssVars = {
  ...defaultCSSVars,
  ...defaultDangerCSSVars,
  ...defaultInfoCSSVars,
  ...defaultSuccessCSSVars,
  ...defaultWarningCSSVars,

  ...primaryCSSVars,
  ...primaryDangerCSSVars,
  ...primaryInfoCSSVars,
  ...primarySuccessCSSVars,
  ...primaryWarningCSSVars,

  ...linkCSSVars,
  ...linkDangerCSSVars,
  ...linkInfoCSSVars,
  ...linkSuccessCSSVars,
  ...linkWarningCSSVars
};

export { component };
