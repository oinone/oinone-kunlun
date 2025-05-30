import { currentOioThemeType } from '../init';
import { darkVars } from './dark-vars';
import { defaultVars } from './default-vars';

interface IMenuColorVars {
  'main-background': string;
  'body-background': string;
  'border-color': string;
  'text-color': string;
  'icon-color': string;
  'text-color-rgb': string;
  'primary-color': string;
  'hover-background-color': string;
  'text-color-secondary': string;
  'active-parent-title-color': string;
  'collapsed-button-background-color': string;
  'designer-font-color': string;
  'select-background': string;
  'placeholder-color': string;
  'select-color': string;
  'select-dropdown-background': string;
  'select-dropdown-selected-color': string;
  'select-dropdown-color': string;
  'select-dropdown-selected': string;
  'select-dropdown-box-shadow': string;
}

/**
 * 默认主题的菜单css变量
 */
const defaultMenuColorVars: IMenuColorVars = {
  'main-background': defaultVars['main-background'],
  'body-background': defaultVars['main-background'],
  'border-color': defaultVars['border-color'],
  'text-color': defaultVars['text-color'],
  'icon-color': defaultVars['icon-color'],
  'text-color-rgb': defaultVars['text-color-rgb'],
  'primary-color': defaultVars['primary-color'],
  'hover-background-color': defaultVars['hover-background-color'],
  'text-color-secondary': defaultVars['text-color-secondary'],
  'active-parent-title-color': 'rgba(0, 0, 0, 0.85)',
  'collapsed-button-background-color': 'rgba(38, 38, 38, 0.05)',
  'designer-font-color': '#333333',
  'select-background': defaultVars['main-background'],
  'placeholder-color': defaultVars['placeholder-color'],
  'select-color': defaultVars['text-color'],
  'select-dropdown-background': defaultVars['main-background'],
  'select-dropdown-selected-color': defaultVars['primary-color'],
  'select-dropdown-color': defaultVars['text-color-secondary'],
  'select-dropdown-selected': defaultVars['hover-background-color'],
  'select-dropdown-box-shadow':
    '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),0 9px 28px 8px rgba(0, 0, 0, 0.05)'
};

/**
 * 暗色主题的菜单css变量
 */

const darkMenuColorVars: IMenuColorVars = {
  'main-background': darkVars['main-background'],
  'body-background': darkVars['body-background'],
  'border-color': darkVars['border-color'],
  'text-color': darkVars['text-color'],
  'icon-color': darkVars['icon-color'],
  'text-color-rgb': darkVars['text-color-rgb'],
  'primary-color': '#fff',
  'hover-background-color': darkVars['hover-background-color'],
  'text-color-secondary': darkVars['text-color-secondary'],
  'active-parent-title-color': '#fff',
  'collapsed-button-background-color': 'rgba(38, 38, 38, 0.05)',
  'designer-font-color': '#333333',
  'select-background': darkVars['body-background'],
  'placeholder-color': darkVars['placeholder-color'],
  'select-color': darkVars['text-color'],
  'select-dropdown-background': darkVars['main-background'],
  'select-dropdown-selected-color': '#fff',
  'select-dropdown-color': darkVars['text-color'],
  'select-dropdown-selected': darkVars['hover-background-color'],
  'select-dropdown-box-shadow': '0px 0px 6px 0px rgba(0,0,0,0.2)'
};

export const getMenuColorVarsByTheme = () => {
  const menuColorVars = currentOioThemeType === 'dark' ? darkMenuColorVars : defaultMenuColorVars;

  return {
    'background-color': menuColorVars['main-background'],
    'border-color': menuColorVars['border-color'],
    'font-color': menuColorVars['text-color'],
    'expand-background-color': menuColorVars['main-background'],
    'default-icon-color': menuColorVars['icon-color'],
    'default-expand-icon-color': `rgba(${menuColorVars['text-color-rgb']}, 0.75)`,
    'search-background-color': menuColorVars['body-background'],

    'select-dropdown-background': menuColorVars['select-dropdown-background'],
    'select-dropdown-color': menuColorVars['select-dropdown-color'],
    'select-dropdown-selected-color': menuColorVars['select-dropdown-selected-color'],
    'select-dropdown-selected': menuColorVars['select-dropdown-selected'],
    'select-dropdown-box-shadow': menuColorVars['select-dropdown-box-shadow'],
    'select-color': menuColorVars['select-color'],
    'select-background': menuColorVars['select-background'],
    'select-placeholder-color': menuColorVars['placeholder-color'],
    'selected-icon-color': menuColorVars['primary-color'],
    'selected-background-color': menuColorVars['hover-background-color'],
    'selected-title-color': menuColorVars['primary-color'],
    'selected-title-hover-color': menuColorVars['primary-color'],
    'selected-root-title-color': menuColorVars['primary-color'],
    'selected-root-icon-color': menuColorVars['primary-color'],
    'selected-root-background-color': menuColorVars['hover-background-color'],

    'hover-background-color': menuColorVars['hover-background-color'],

    'root-title-hover-color': menuColorVars['primary-color'],
    'root-title-hover-icon-color': menuColorVars['primary-color'],
    'active-parent-title-color': menuColorVars['active-parent-title-color'],

    'search-display': 'unset',
    'search-background': menuColorVars['body-background'],

    'collapsed-button-hover-background-color': menuColorVars['hover-background-color'],
    'collapsed-button-background-color': menuColorVars['collapsed-button-background-color'],

    'collapsed-button-title-color': menuColorVars['text-color-secondary'],

    // 设计器菜单
    'designer-font-color': menuColorVars['designer-font-color'],
    'designer-background-color': menuColorVars['main-background'],
    'designer-collapsed-button-hover-background-color': menuColorVars['hover-background-color'],
    'designer-collapsed-button-background-color': menuColorVars['collapsed-button-background-color']
  };
};
