import { ref, watchEffect } from 'vue';
import { IPermissionDslActions } from '../types';

const state = ref<IPermissionDslActions>({
  hasModifyRoleAction: true,
  hasModifyManagementRoleAction: true,
  hasPermissionUpdateAction: true,
  hasPermissionCreateAction: true,
  hasPermissionCreateBatchAction: true,
  hasActiveGroupAction: true,
  hasCancelGroupAction: true,
  hasDeleteGroupAction: true,
  hasAuthGroupSystemPermissionLookupAction: true,
  hasCollectionPermissionItemsAction: true
});

export const useDslActionPermission = () => {
  const use = (props: { permissionActions: IPermissionDslActions }) => {
    watchEffect(() => {
      const permissionActions = props.permissionActions || {};
      state.value.hasModifyRoleAction = permissionActions.hasModifyRoleAction;
      state.value.hasModifyManagementRoleAction = permissionActions.hasModifyManagementRoleAction;
      state.value.hasPermissionUpdateAction = permissionActions.hasPermissionUpdateAction;
      state.value.hasPermissionCreateAction = permissionActions.hasPermissionCreateAction;
      state.value.hasPermissionCreateBatchAction = permissionActions.hasPermissionCreateBatchAction;
      state.value.hasActiveGroupAction = permissionActions.hasActiveGroupAction;
      state.value.hasCancelGroupAction = permissionActions.hasCancelGroupAction;
      state.value.hasDeleteGroupAction = permissionActions.hasDeleteGroupAction;
      state.value.hasAuthGroupSystemPermissionLookupAction = permissionActions.hasAuthGroupSystemPermissionLookupAction;
      state.value.hasCollectionPermissionItemsAction = permissionActions.hasCollectionPermissionItemsAction;
    });
  };

  return {
    use,
    state
  };
};
