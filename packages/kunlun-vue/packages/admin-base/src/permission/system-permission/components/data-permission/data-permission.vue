<template>
  <div>
    <div class="data-permission-rsql">
      <div style="margin: 5px 0 10px 0">
        <span style="margin-right: 5px" class="data-permission-tab-label">{{ $translate('权限范围') }}</span>
        <span>{{ help }}</span>
      </div>
      <div class="permission-exp-display-name">{{ dataPermission.domainExpDisplayName }}</div>
      <rsql-express
        ref="rsqlExpressRef"
        v-if="dataPermission.model"
        :model="dataPermission.model"
        :init-mode="initMode"
        :domainExpJson="dataPermission.domainExpJson"
        :value="dataPermission.domainExp"
        :disabled="!showOkAction"
        @change="onDomainExpChange"
      ></rsql-express>
    </div>

    <div class="data-permission-operator">
      <div>
        <div class="data-permission-tab-label">{{ $translate('权限') }}</div>
        <a-space :size="100">
          <a-space :size="16">
            <span>{{ $translate('读权限') }}</span>
            <a-switch class="oio-switch" :disabled="!showOkAction" v-model:checked="dataPermission.permRead"></a-switch>
          </a-space>
          <!-- <a-space :size="16">
            <span>{{ $translate('写权限') }}</span>
            <a-switch
              class="oio-switch"
              :disabled="!showOkAction"
              v-model:checked="dataPermission.permWrite"
            ></a-switch>
          </a-space>
          <a-space :size="16">
            <span>{{ $translate('删除权限') }}</span>
            <a-switch
              class="oio-switch"
              :disabled="!showOkAction"
              v-model:checked="dataPermission.permDelete"
            ></a-switch>
          </a-space> -->
        </a-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExpressionMode } from '@oinone/kunlun-vue-expression';
import { defineEmits, defineExpose, defineProps, ref, withDefaults } from 'vue';
import { IPermission } from '../../../permission/type';
import RsqlExpress from '../RsqlExpress.vue';

const emits = defineEmits(['update']);

const props = withDefaults(defineProps<{ dataPermission: IPermission; help: string; showOkAction: boolean }>(), {
  dataPermission: {} as any,
  help: '',
  showOkAction: true
});

let initMode: ExpressionMode | undefined;
if (props.dataPermission.domainExp && !props.dataPermission?.domainExpJson) {
  initMode = ExpressionMode.SOURCE;
}

const onDomainExpChange = ({ exp, expDisplayName, domainExpJson }) => {
  props.dataPermission.domainExp = exp;
  props.dataPermission.domainExpDisplayName = expDisplayName;
  if (domainExpJson !== undefined) {
    props.dataPermission.domainExpJson = domainExpJson;
  }

  emits('update', props.dataPermission);
};

const rsqlExpressRef = ref(null as any);

function submitExp() {
  return rsqlExpressRef.value?.submitExp();
}

defineExpose({ submitExp });
</script>

<style lang="scss"></style>
