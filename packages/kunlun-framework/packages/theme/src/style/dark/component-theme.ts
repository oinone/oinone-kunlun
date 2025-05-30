import {
  largeInputSizeVars,
  largeMenuSizeVars,
  largePaginationSizeVars,
  largeSelectSizeVars,
  largeTableSizeVars,
  largeTabsSizeVars,
  largeTreeSelectSizeVars,
  mediumInputSizeVars,
  mediumMenuSizeVars,
  mediumPaginationSizeVars,
  mediumSelectSizeVars,
  mediumTableSizeVars,
  mediumTabsSizeVars,
  mediumTreeSelectSizeVars,
  smallMenuSizeVars,
  smallPaginationSizeVars,
  smallSelectSizeVars,
  smallTableSizeVars,
  smallTabsSizeVars,
  smallTreeSelectSizeVars
} from '../../size';
import { component as AppSwitch, cssVars as AppSwitchCSSVars } from './app-switch/app-switch';
import { component as Button, cssVars as ButtonCSSVars } from './button';
import { component as Checkbox, cssVars as checkboxCSSVars } from './checkbox/checkbox';
import { component as Drawer, cssVars as DrawerCSSVars } from './drawer/drawer';
import { component as Dropdown, cssVars as DropdownCSSVars } from './dropdown';
import { component as FormItem, cssVars as FormItemCSSVars } from './form-item/form-item';
import { component as Header, cssVars as HeaderCSSVars } from './header/header';
import { component as Input, cssVars as InputCSSVars } from './input/input';
import { component as Menu, cssVars as MenuCSSVars } from './menu/menu';
import { component as Modal, cssVars as ModalCSSVars } from './modal/modal';
import { component as MultiTab, cssVars as MultiTabCSSVars } from './multi-tab/multi-tab';
import { component as Pagination, cssVars as PaginationCSSVars } from './pagination/pagination';
import { component as Popconfirm, cssVars as PopconfirmCSSVars } from './popconfirm/popconfirm';
import { component as RichText, cssVars as RichTextCSSVars } from './rich-text/rich-text';
import { component as Scrollbar, cssVars as ScrollbarCSSVars } from './scrollbar/scrollbar';
import { component as Select, cssVars as SelectCSSVars } from './select/select';
import { component as Switch, cssVars as switchCSSVars } from './switch/switch';
import { component as Table, cssVars as TableCSSVars } from './table/table';
import { component as Tabs } from './tabs/tabs';
import { component as Textarea, cssVars as TextareaCSSVars } from './textarea/textarea';
import { component as Transfer, cssVars as TransferCSSVars } from './transfer/transfer';
import { component as TreeSelect } from './tree-select/tree-select';
import { component as Upload, cssVars as UploadCSSVars } from './upload/upload';

export const getComponentTheme = () => {
  return {
    [MultiTab]: {
      large: { ...MultiTabCSSVars },
      medium: { ...MultiTabCSSVars },
      small: { ...MultiTabCSSVars }
    },
    [Button]: {
      large: ButtonCSSVars,
      medium: ButtonCSSVars,
      small: ButtonCSSVars
    },
    [Input]: {
      large: {
        ...InputCSSVars,
        ...largeInputSizeVars
      },
      medium: {
        ...InputCSSVars,
        ...mediumInputSizeVars
      },
      small: {
        ...InputCSSVars,
        ...mediumInputSizeVars
      }
    },
    [Checkbox]: {
      large: { ...checkboxCSSVars },
      medium: { ...checkboxCSSVars },
      small: { ...checkboxCSSVars }
    },
    [Switch]: {
      large: { ...switchCSSVars },
      medium: { ...switchCSSVars },
      small: { ...switchCSSVars }
    },
    [Pagination]: {
      large: { ...PaginationCSSVars, ...largePaginationSizeVars },
      medium: { ...PaginationCSSVars, ...mediumPaginationSizeVars },
      small: { ...PaginationCSSVars, ...smallPaginationSizeVars }
    },
    [Select]: {
      large: { ...SelectCSSVars, ...largeSelectSizeVars },
      medium: { ...SelectCSSVars, ...mediumSelectSizeVars },
      small: { ...SelectCSSVars, ...smallSelectSizeVars }
    },
    [Textarea]: {
      large: TextareaCSSVars,
      medium: TextareaCSSVars,
      small: TextareaCSSVars
    },
    [Upload]: {
      large: UploadCSSVars,
      medium: UploadCSSVars,
      small: UploadCSSVars
    },
    [Menu]: {
      large: { ...MenuCSSVars(), ...largeMenuSizeVars },
      medium: { ...MenuCSSVars(), ...mediumMenuSizeVars },
      small: { ...MenuCSSVars(), ...smallMenuSizeVars }
    },
    [AppSwitch]: {
      large: AppSwitchCSSVars,
      medium: AppSwitchCSSVars,
      small: AppSwitchCSSVars
    },
    [Table]: {
      large: { ...TableCSSVars, ...largeTableSizeVars },
      medium: { ...TableCSSVars, ...mediumTableSizeVars },
      small: { ...TableCSSVars, ...smallTableSizeVars }
    },
    [Header]: {
      large: HeaderCSSVars,
      medium: HeaderCSSVars,
      small: HeaderCSSVars
    },
    [Modal]: {
      large: ModalCSSVars,
      medium: ModalCSSVars,
      small: ModalCSSVars
    },
    [Popconfirm]: {
      large: PopconfirmCSSVars,
      medium: PopconfirmCSSVars,
      small: PopconfirmCSSVars
    },
    [TreeSelect]: {
      large: largeTreeSelectSizeVars,
      medium: mediumTreeSelectSizeVars,
      small: smallTreeSelectSizeVars
    },
    [Transfer]: {
      large: TransferCSSVars,
      medium: TransferCSSVars,
      small: TransferCSSVars
    },
    [Scrollbar]: {
      large: ScrollbarCSSVars,
      medium: ScrollbarCSSVars,
      small: ScrollbarCSSVars
    },
    [Drawer]: {
      large: DrawerCSSVars,
      medium: DrawerCSSVars,
      small: DrawerCSSVars
    },
    [Dropdown]: {
      large: DropdownCSSVars,
      medium: DropdownCSSVars,
      small: DropdownCSSVars
    },
    [FormItem]: {
      large: FormItemCSSVars,
      medium: FormItemCSSVars,
      small: FormItemCSSVars
    },
    [RichText]: {
      large: RichTextCSSVars,
      medium: RichTextCSSVars,
      small: RichTextCSSVars
    },
    [Tabs]: {
      large: largeTabsSizeVars,
      medium: mediumTabsSizeVars,
      small: smallTabsSizeVars
    }
  };
};
