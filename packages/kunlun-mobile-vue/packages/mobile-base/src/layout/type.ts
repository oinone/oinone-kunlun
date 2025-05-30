import {
  ActionElement,
  Entity,
  IAction,
  IDslNode,
  IModel,
  IModule
} from '@kunlun/meta';
import { UserInfo } from '@kunlun/engine';

interface IAstNode {
  name: string;
  props: Record<string, string>;
  children: IAstNode[];
}

interface IColumn {
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

interface IGlobalState {
  rootData: Record<string, unknown> | Record<string, unknown>[];
  user: UserInfo;
  currentModule: IModule;
  modules: Omit<IModule, 'allMenus'>[];
}

enum ValidatorStatus {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Validating = 'validating'
}

interface ValidatorInfo {
  message?: string;
  status?: ValidatorStatus;
  path: string;
  children?: ValidatorInfo[];
}

interface ValidatorCallback {
  resolve: (result: boolean) => void;
  // reject: () => ValidatorError;
}
interface UpdateCallback {
  resolve: () => void;
  reject?: () => void;
  actionElement?: ActionElement;
}
interface NormalCallback<T> {
  resolve: (value: T) => void;
  reject?: (value: T) => void;
  actionElement?: ActionElement;
}
const GlobalStateSubSymbol = Symbol('GlobalStateSubSymbol');
const ValidatorSubSymbol = Symbol('ValidatorSubSymbol');
const ValidatorResSubSymbol = Symbol('ValidatorResSubSymbol');

const WatchTableRowSubSymbol = Symbol('WatchTableRowSubSymbol');

const UpdateSubSymbol = Symbol('UpdateSubSymbol');
const CreateSubSymbol = Symbol('CreateSubSymbol');

const MenusSubSymbol = Symbol('MenusSubSymbol');
const MenusCollapsedSymbol = Symbol('MenusCollapsedSymbol');

interface IPreciseTableRowData {
  index: number;
  value: Entity;
}

// action 与 视图之间的信息传递
type UpperContext = {
  // 选中了表格的哪些行
  rows?: Entity[];
  // m2m 添加打开的 Table 选中了哪些行 | o2m 创建或编辑打开的 form 数据
  selectedRows?: Entity[];
  // 点击的 action
  activeAction?: IAction;

  cache: SubmitCache[];
};
// 增量提交模式(SubmitType == 'increment')时且模型下存在o2m或m2m关联数据需要存储的时候，关联模型的数据存在该对象中
interface SubmitCache {
  operator: SubmitCacheOperator;
  model: IModel;
  record: Entity;
}
enum SubmitCacheOperator {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete'
}
export const RELOAD_VIEW = Symbol('Reload_View');
export const REFRESH_DATA = Symbol('Refresh_Data');

export const SWITCH_APP_COLLECTION = Symbol('Switch-App-Collection');

export const SWITCH_APP_STATUS = Symbol('SWITCH_APP_STATUS');

export const EXECUTE_HOME_PAGE = Symbol('Execute-Home-Page');

export {
  IAstNode,
  IColumn,
  IGlobalState,
  GlobalStateSubSymbol,
  ValidatorSubSymbol,
  ValidatorCallback,
  ValidatorStatus,
  ValidatorInfo,
  ValidatorResSubSymbol,
  UpdateSubSymbol,
  CreateSubSymbol,
  MenusSubSymbol,
  MenusCollapsedSymbol,
  WatchTableRowSubSymbol,
  IPreciseTableRowData,
  UpdateCallback,
  NormalCallback,
  UpperContext,
  SubmitCache,
  SubmitCacheOperator,
  UserInfo
};
