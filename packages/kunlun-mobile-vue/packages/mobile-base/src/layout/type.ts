import type { ActionElement, Entity, IAction, IDslNode, IModel, IModule } from '@oinone/kunlun-meta';
import type { UserInfo } from '@oinone/kunlun-engine';

export interface IAstNode {
  name: string;
  props: Record<string, string>;
  children: IAstNode[];
}

export interface IColumn {
  title?: string;
  width?: number | string;
  dataIndex: string | number;
  key: string | number;
  fixed?: 'right' | 'left';
  slots: {
    [props: string]: string;
  };
  widget?: string;
  node?: IDslNode;
  sorter?: Function | null;
  sortDirections?: any[];
}

interface PamirsUser {
  id: string;
  name: string;
  lang?: {
    code: string;
    createDate: string;
    dateFormat: string;
    decimalPoint: string;
    direction: string;
    groupingRule: string;
    id: string;
    installState: boolean;
    isoCode: string;
    name: string;
    thousandsSep: string;
    timeFormat: string;
    weekStart: string;
    writeDate: string;
    };
}

export interface IGlobalState {
  rootData: Record<string, unknown> | Record<string, unknown>[];
  user: UserInfo;
  currentModule: IModule;
  modules: Omit<IModule, 'allMenus'>[];
}

export enum ValidatorStatus {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Validating = 'validating'
}

export interface ValidatorInfo {
  message?: string;
  status?: ValidatorStatus;
  path: string;
  children?: ValidatorInfo[];
}

export interface ValidatorCallback {
  resolve: (result: boolean) => void;
  // reject: () => ValidatorError;
}
export interface UpdateCallback {
  resolve: () => void;
  reject?: () => void;
  actionElement?: ActionElement;
}
export interface NormalCallback<T> {
  resolve: (value: T) => void;
  reject?: (value: T) => void;
  actionElement?: ActionElement;
}
export const GlobalStateSubSymbol = Symbol('GlobalStateSubSymbol');
export const ValidatorSubSymbol = Symbol('ValidatorSubSymbol');
export const ValidatorResSubSymbol = Symbol('ValidatorResSubSymbol');

export const WatchTableRowSubSymbol = Symbol('WatchTableRowSubSymbol');

export const UpdateSubSymbol = Symbol('UpdateSubSymbol');
export const CreateSubSymbol = Symbol('CreateSubSymbol');

export const MenusSubSymbol = Symbol('MenusSubSymbol');
export const MenusCollapsedSymbol = Symbol('MenusCollapsedSymbol');

export interface IPreciseTableRowData {
  index: number;
  value: Entity;
}

// action 与 视图之间的信息传递
export type UpperContext = {
  // 选中了表格的哪些行
  rows?: Entity[];
  // m2m 添加打开的 Table 选中了哪些行 | o2m 创建或编辑打开的 form 数据
  selectedRows?: Entity[];
  // 点击的 action
  activeAction?: IAction;

  cache: SubmitCache[];
};
// 增量提交模式(SubmitType == 'increment')时且模型下存在o2m或m2m关联数据需要存储的时候，关联模型的数据存在该对象中
export interface SubmitCache {
  operator: SubmitCacheOperator;
  model: IModel;
  record: Entity;
}
export enum SubmitCacheOperator {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete'
}
export const RELOAD_VIEW = Symbol('Reload_View');
export const REFRESH_DATA = Symbol('Refresh_Data');

export const SWITCH_APP_COLLECTION = Symbol('Switch-App-Collection');

export const SWITCH_APP_STATUS = Symbol('SWITCH_APP_STATUS');

export const EXECUTE_HOME_PAGE = Symbol('Execute-Home-Page');

export type { UserInfo };
