import { Pagination } from '@kunlun/engine';
import { Slot } from 'vue';

export interface Options {
  label: string;
  value: string | undefined;
}

export const HomePageConfigKeys = [
  'ruleName',
  'expression',
  'bindingType',
  'bindHomePageModule',
  'bindHomePageMenu',
  'bindHomePageView',
  'bindHomePageModel',
  'enabled',
  'id'
];

export enum BindingTypeEnum {
  MENU = 'MENU',
  VIEW = 'VIEW'
}

export interface HomepageConfigRule {
  ruleName: string;
  expression: string;
  expressionJson: string;
  bindingType: BindingTypeEnum;
  bindHomePageModule?: { id: string; module: string; displayName: string };
  bindHomePageMenu?: { id: string; name: string; module: string; displayName: string };
  bindHomePageView?: { id: string; model: string; name: string; title: string };
  bindHomePageModel?: { id: string; model: string; displayName: string };
  enabled: boolean;
  code: string;

  [key: string]: unknown;
}

export interface HomePageConfig {
  state: boolean;
  rules: HomepageConfigRule[];
}

export enum HomePageBindingType {
  MENU = 'menu',
  VIEW = 'view'
}

export interface FetchValueOptions {
  searchValue?: string;
  pagination: Pagination;
}

export interface FetchValueReturnType {
  options?: Record<string, unknown>[];
  content?: Record<string, unknown>[];
  totalPages: number;
}

export enum LogicOperatorEnum {
  And = '且',
  Or = '或'
}

export enum RoleUserOptionsEnum {
  CurrentUser = 'currentUser',
  CurrentRole = 'currentRole'
}

export enum RelationOptionsEnum {
  Include = '=in=',
  Equal = '=='
}

export enum EnableStatusOptionsEnum {
  Enable = 'enable',
  Forbidden = 'forbidden'
}

export const RoleUserOptions: Array<Options> = [
  { label: '当前用户', value: RoleUserOptionsEnum.CurrentUser },
  { label: '当前角色', value: RoleUserOptionsEnum.CurrentRole }
];

export const RelationOptions: Array<Options> = [
  { label: '包含', value: RelationOptionsEnum.Include },
  { label: '等于', value: RelationOptionsEnum.Equal }
];

export const EnableStatusOptions: Array<Options> = [
  { label: '全部', value: undefined },
  { label: '启用', value: EnableStatusOptionsEnum.Enable },
  { label: '禁用', value: EnableStatusOptionsEnum.Forbidden }
];

export interface ExpressionOptions {
  RoleUserOptions?: Array<Options>;
  RelationOptions?: Array<Options>;
  UserOptions?: Array<Options>;
  fetchValue: (options: FetchValueOptions) => Promise<FetchValueReturnType>;
  queryOne: (id: string) => Promise<Record<string, unknown>>;
}

export interface ExpressionValue {
  roleUserEnum: string;
  relation: string;
  roleUserValue: Record<string, any>;
  logicOperator: LogicOperatorEnum;
}

export interface ExpressionItem {
  options: ExpressionOptions;
  values: ExpressionValue;
  key: string;
}

export interface FormWidgetSlots {
  key: string;
  formWidgetSlot: Slot;
}
