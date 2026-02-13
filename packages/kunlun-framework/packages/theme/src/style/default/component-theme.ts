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
import { component as AiChat, cssVars as AiChatCSSVars } from './ai-chat';
import { component as AppSwitch, cssVars as AppSwitchCSSVars } from './app-switch/app-switch';
import { component as Button, cssVars as ButtonCSSVars } from './button';
import { component as Card, cssVars as CardCSSVars } from './card/card';
import { component as Checkbox, cssVars as CheckboxCSSVars } from './checkbox/checkbox';
import { component as Datetime, cssVars as DatetimeCSSVars } from './datetime/datetime';
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
import { component as Switch, cssVars as SwitchCSSVars } from './switch/switch';
import { component as Table, cssVars as TableCSSVars } from './table/table';
import { component as Tabs, cssVars as TabsCSSVars } from './tabs/tabs';
import { component as Tag, cssVars as TagCSSVars } from './tag';
import { component as Textarea, cssVars as TextareaCSSVars } from './textarea/textarea';
import { component as Transfer, cssVars as TransferCSSVars } from './transfer/transfer';
import { component as TreeSelect } from './tree-select/tree-select';
import { component as Upload, cssVars as UploadCSSVars } from './upload/upload';

export const getComponentTheme = () => ({
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
    large: { ...CheckboxCSSVars },
    medium: { ...CheckboxCSSVars },
    small: { ...CheckboxCSSVars }
  },
  [Datetime]: {
    large: { ...DatetimeCSSVars },
    medium: { ...DatetimeCSSVars },
    small: { ...DatetimeCSSVars }
  },
  [Switch]: {
    large: { ...SwitchCSSVars },
    medium: { ...SwitchCSSVars },
    small: { ...SwitchCSSVars }
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
    large: { ...largeTabsSizeVars, ...TabsCSSVars },
    medium: { ...mediumTabsSizeVars, ...TabsCSSVars },
    small: { ...smallTabsSizeVars, ...TabsCSSVars }
  },
  [Card]: {
    large: CardCSSVars,
    medium: CardCSSVars,
    small: CardCSSVars
  },
  [Tag]: {
    large: TagCSSVars,
    medium: TagCSSVars,
    small: TagCSSVars
  },
  [AiChat]: {
    large: AiChatCSSVars,
    medium: AiChatCSSVars,
    small: AiChatCSSVars
  }
});
