export enum IPermissionModeEnum {
  BASE = 'BASE',
  VIEW = 'VIEW'
}

export interface IPermissionDslActions {
  hasModifyRoleAction: boolean; // 是否有修改访问权限组角色的动作
  hasModifyManagementRoleAction: boolean; // 是否有修改管理权限组角色的动作
  hasPermissionUpdateAction: boolean; // 是否有修改分组的动作
  hasPermissionCreateAction: boolean; // 是否有创建分组的动作
  hasAuthGroupSystemPermissionLookupAction: boolean; // 是否有查看分组的动作
  hasPermissionCreateBatchAction: boolean; // 是否有批量修改角色的动作
  hasActiveGroupAction: boolean; // 是否有「分组生效」的动作
  hasCancelGroupAction: boolean; // 是否有「分组失效」的动作
  hasDeleteGroupAction: boolean; // 是否有「删除分组」的动作
  hasCollectionPermissionItemsAction: boolean; // 是否有「收集权限项」的动作
}
