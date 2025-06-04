<template>
  <div class="permission-mode">
    <oio-button
      :type="permissionMode === IPermissionModeEnum.BASE ? 'primary' : 'default'"
      @click="changePermissionMode(IPermissionModeEnum.BASE)"
      >{{ translateValueByKey('基础管理模式') }}</oio-button
    >
    <oio-button
      :type="permissionMode === IPermissionModeEnum.VIEW ? 'primary' : 'default'"
      @click="changePermissionMode(IPermissionModeEnum.VIEW)"
      >{{ translateValueByKey('权限查阅模式') }}</oio-button
    >
  </div>
</template>
<script lang="ts" setup>
import { ref, defineProps, withDefaults } from 'vue';
import { executeViewAction, RuntimeViewAction, translateValueByKey } from '@oinone/kunlun-engine';

import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { IPermissionModeEnum } from '../types';
import { ViewType } from '@oinone/kunlun-meta';

const props = withDefaults(defineProps<{ permissionMode: IPermissionModeEnum }>(), {
  permissionMode: IPermissionModeEnum.BASE
});

const permissionMode = ref(props.permissionMode);

function changePermissionMode(mode: IPermissionModeEnum) {
  permissionMode.value = mode;
  if (mode == IPermissionModeEnum.BASE) {
    executeViewAction({
      name: 'auth#authGroupCustom',
      moduleName: 'auth',
      model: 'auth.AuthGroup',
      viewType: ViewType.Table
    } as RuntimeViewAction);
  } else {
    executeViewAction({
      name: 'authGroupLookupRole',
      moduleName: 'auth',
      model: 'auth.AuthGroup',
      viewType: ViewType.Table
    } as RuntimeViewAction);
  }
}
</script>
<style lang="scss">
.permission-mode {
  display: flex;
  justify-content: flex-end;
  margin-top: -38px;
  .oio-button {
    width: 120px;
    margin-left: var(--oio-margin-md);
  }
}
</style>
