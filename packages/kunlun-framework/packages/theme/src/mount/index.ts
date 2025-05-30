import { getTheme } from '../register';
import { DefaultThemeName, ThemeName } from '../typing';
import { DEFAULT_PREFIX } from './constant';

/**
 * el:
 * 初始化时为body
 * 应用加载时应用父类class
 * 页面加载时页面父类class
 */
const THEME_CONFIG: Record<string, any> = {};

export function genCSSVars(themes: ThemeName[], el?: string, prefix?: string) {
  const headNode = document.querySelector('head')!;

  const element = el
    ? (document.getElementsByClassName(el)[0] as HTMLElement)
    : (document.documentElement as HTMLElement);
  if (!element) {
    throw new Error('挂载dom匹配失败');
  }

  const styleTags = Array.from(document.getElementsByTagName('style')) || [];

  // 每次构建的时候，都需要初始化默认主题
  const currentThemes = [DefaultThemeName.DEFAULT_MEDIUM, ...themes];

  const cssVars = currentThemes
    .map((t) => getTheme(t) || {})
    .reduce((preVars, nextVars) => {
      return Object.assign(preVars, nextVars);
    }, {});

  if (!Object.keys(cssVars).length) {
    return;
  }

  const className = 'oio-theme';
  const themeTag = styleTags.find((tag) => tag.getAttribute('theme-id') === className);

  const styleRules = Object.keys(cssVars)
    .map((key) => {
      if (Object.prototype.toString.call(cssVars[key]) === '[object Object]') {
        THEME_CONFIG[key] = cssVars[key];
        return '';
      }
      return `--${prefix || DEFAULT_PREFIX}-${key}: ${cssVars[key]};`;
    })
    .filter((v) => v);

  const innerHTML = `:root{${styleRules.join('')}}`;

  if (themeTag) {
    themeTag.innerHTML = innerHTML;
  } else {
    const style = document.createElement('style');

    [
      { key: 'type', value: 'text/css' },
      { key: 'theme-id', value: className }
    ].forEach(({ key, value }) => style!.setAttribute(key, value));

    style.innerHTML = innerHTML;

    headNode.appendChild(style);
  }
}

export { DEFAULT_PREFIX, THEME_CONFIG };
