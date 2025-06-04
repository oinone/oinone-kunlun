<template>
  <oio-modal
    popup-mode
    :class="`${DEFAULT_PREFIX}-view-dialog`"
    :visible="visible"
    teleport="body"
    :title="title"
    :width="width"
    height="80vh"
    :mask-closable="maskClosable"
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
          <oio-button type="primary" :loading="actionLoading" @click="onOk"
            >{{ okText || translate('kunlun.common.confirm') }}
          </oio-button>
          <oio-button @click="onCancel">{{ cancelText || translate('kunlun.common.cancel') }}</oio-button>
        </template>
        <template v-else>
          <oio-button @click="onCancel">{{ cancelText || translate('kunlun.common.cancel') }}</oio-button>
          <oio-button type="primary" @click="onOk" :loading="actionLoading"
            >{{ okText || translate('kunlun.common.confirm') }}
          </oio-button>
        </template>
      </template>
    </template>
  </oio-modal>
</template>

<script lang="ts">
import { OioButton, OioModal } from '@oinone/kunlun-vue-ui-mobile-vant';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { defineComponent } from 'vue';
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '../../../basic';
import { DEFAULT_PREFIX } from '../../../ui/theme';

export default defineComponent({
  components: {
    OioModal,
    OioButton
  },
  props: [
    'visible',
    'okText',
    'cancelText',
    'help',
    'actionLoading',
    'actionReverse',
    'onVisibleChange',
    'onOk',
    'onCancel',
    'translate',
    'title',
    'width',
    'height',
    'closeIcon',
    'teleport',
    'fixedHeight',
    'maskClosable',
    'allMounted',
    'openHandle',
    'placement'
  ],
  setup(props) {
    onAllMounted(() => {
      props.allMounted?.();
    });

    const formContext = useInjectOioDefaultFormContext();

    useProviderOioDefaultFormContext({
      ...formContext,
      getTriggerContainer: (triggerNode) => {
        return triggerNode.parentNode || document.body;
      }
    });

    return { DEFAULT_PREFIX };
  }
});
</script>
<style lang="scss"></style>
