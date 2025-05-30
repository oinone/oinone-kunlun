import { ActionType } from '@kunlun/meta';

export enum ResourcePermissionTypeEnum {
  MODULE = 'MODULE',
  MENU = 'MENU',
  VIEW = 'VIEW',
  ACTION = 'ACTION',
  FUNCTION = 'FUNCTION',
  CUSTOM = 'CUSTOM'
}

export enum ResourcePermissionSubtypeEnum {
  MODULE = 'MODULE',
  HOMEPAGE = 'HOMEPAGE',
  MENU = 'MENU',
  VIEW = 'VIEW',
  SERVER_ACTION = 'SERVER_ACTION',
  VIEW_ACTION = 'VIEW_ACTION',
  URL_ACTION = 'URL_ACTION',
  CLIENT_ACTION = 'CLIENT_ACTION',
  FUNCTION = 'FUNCTION',
  CUSTOM = 'CUSTOM'
}

export interface PermissionNode {
  id: string;
  parentId: string;
  hasNext: boolean;
  canAccess: boolean;
  canManagement: boolean;
  canAllot: boolean;
  canDesign: boolean;
  nodeType: ResourcePermissionSubtypeEnum;
  resourceId: string;
  path: string;
  displayValue: string;
  nodes?: AnyPermissionNode[];
}

export interface ModulePermissionNode extends PermissionNode {
  module: string;
  icon: string;
}

export interface HomepagePermissionNode extends PermissionNode {
  module: string;
  model: string;
  action: string;
}

export interface MenuPermissionNode extends PermissionNode {
  module: string;
  model: string;
  name: string;
  action: string;
}

export interface ActionPermissionNode extends PermissionNode {
  model: string;
  action: string;
  actionType: ActionType;
  menuName: string;
}

export type AnyPermissionNode =
  | ModulePermissionNode
  | HomepagePermissionNode
  | MenuPermissionNode
  | ActionPermissionNode
  | PermissionNode;

export function isModulePermissionNode(node: AnyPermissionNode): node is ModulePermissionNode {
  return node.nodeType === ResourcePermissionSubtypeEnum.MODULE;
}

export function isHomepagePermissionNode(node: AnyPermissionNode): node is HomepagePermissionNode {
  return node.nodeType === ResourcePermissionSubtypeEnum.HOMEPAGE;
}

export function isMenuPermissionNode(node: AnyPermissionNode): node is MenuPermissionNode {
  return node.nodeType === ResourcePermissionSubtypeEnum.MENU;
}

export function isActionPermissionNode(node: AnyPermissionNode): node is ActionPermissionNode {
  return [
    ResourcePermissionSubtypeEnum.SERVER_ACTION,
    ResourcePermissionSubtypeEnum.VIEW_ACTION,
    ResourcePermissionSubtypeEnum.URL_ACTION,
    ResourcePermissionSubtypeEnum.CLIENT_ACTION
  ].includes(node.nodeType);
}

export interface AuthResourcePermission {
  id?: string;
  code?: string;
  displayName?: string;
  path?: string;
  module?: string;
  model?: string;
  name?: string;
  type?: ResourcePermissionTypeEnum;
  subtype?: ResourcePermissionSubtypeEnum;
  source?: string;
  active?: boolean;
}

export interface AuthResourcePermissionItem extends AuthResourcePermission {
  resourceId?: string;
  canAccess?: boolean;
  canManagement?: boolean;
  canDesign?: boolean;
}
