<template>
  <oio-modal
    popup-mode
    :wrap-class-name="wrapClassName"
    :class="`${DEFAULT_PREFIX}-view-dialog`"
    :visible="visible"
    :getContainer="teleport"
    :closeIcon="closeIcon"
    :title="title"
    :width="width"
    height="75vh"
    :mask-closable="true"
    :destroy-on-close="true"
    :enter-callback="onOk"
    :cancel-callback="onCancel"
    @change="onVisibleChange"
  >
    <slot />
    <template #footer>
      <slot name="footer" />
      <template v-if="!$slots.footer">
        <template v-if="actionReverse">
          <oio-button type="primary" size="large" :loading="actionLoading" @click="onOk"
          >{{ okText || translate('kunlun.common.confirm') }}
          </oio-button>
          <oio-button size="large" @click="onCancel">{{ cancelText || translate('kunlun.common.cancel') }}</oio-button>
        </template>
        <template v-else>
          <oio-button size="large" @click="onCancel">{{ cancelText || translate('kunlun.common.cancel') }}</oio-button>
          <oio-button type="primary" size="large" @click="onOk" :loading="actionLoading"
          >{{ okText || translate('kunlun.common.confirm') }}
          </oio-button>
        </template>
      </template>
    </template>
  </oio-modal>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { StringHelper } from '@kunlun/shared';
import { DEFAULT_PREFIX, OioButton, OioModal } from '@kunlun/vue-ui-mobile-vant';
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '../../../basic';
import { onAllMounted } from '@kunlun/vue-widget';

export default defineComponent({
  name: 'DefaultDialog',
  components: {
    OioModal,
    OioButton
  },
  inheritAttrs: false,
  props: [
    'visible',
    'okText',
    'cancelText',
    'actionLoading',
    'actionReverse',
    'onVisibleChange',
    'onOk',
    'onCancel',
    'translate',
    'title',
    'width',
    'closeIcon',
    'teleport',
    'fixedHeight',
    'allMounted'
  ],
  setup(props) {
    onAllMounted(() => {
      props.allMounted?.();
    });
    const formContext = useInjectOioDefaultFormContext();

    const wrapClassName = computed(() => {
      let classList = ['default-dialog'];
      if (props.fixedHeight) {
        classList = StringHelper.append(classList, 'default-dialog-fixed-height');
      }
      return classList.join(' ');
    });

    useProviderOioDefaultFormContext({
      ...formContext,
      getTriggerContainer: (triggerNode) => {
        return triggerNode.parentNode || document.body;
      }
    });
    return {
      wrapClassName,
      DEFAULT_PREFIX
    };
  }
});
</script>
<style lang="scss"></style>
