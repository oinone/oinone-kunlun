<template>
  <van-popup
    :show="visible"
    :style="{ width }"
    :teleport="teleport"
    :class="classList"
    closeable
    :position="popupMode ? 'bottom' : 'center'"
    round
    safe-area-inset-bottom
    @open="change(true)"
    @close="onCancel"
  >
    <template #default>
      <slot name="header" v-if="!headerInvisible">
        <div :class="`${mainClassName}-header`">
          <slot name="title">{{ title }}</slot>
        </div>
      </slot>
      <div :class="`${mainClassName}-content`">
        <div :class="`${mainClassName}-content-inner`" :style="{ height }">
          <oio-spin :spinning="loading">
            <slot :data="data" />
          </oio-spin>
        </div>
      </div>
      <div :class="`${mainClassName}-footer`" v-if="!footerInvisible">
        <slot name="footer">
          <oio-button type="default" size="large" @click="onCancel">{{
            cancelText || translate('kunlun.common.cancel')
          }}</oio-button>
          <oio-button type="primary" size="large" @click="onOk">{{
            enterText || translate('kunlun.common.confirm')
          }}</oio-button>
        </slot>
      </div>
    </template>
  </van-popup>
</template>
<script lang="ts">
import { ModalWidthType, OioModalProps, StyleHelper, useModal } from '@oinone/kunlun-vue-ui-common';
import { Popup as VanPopup } from 'vant';
import { defineComponent, PropType } from 'vue';
import { isNumber } from 'lodash-es';
import { DEFAULT_PREFIX } from '../../theme';
import { OioButton } from '../oio-button';
import { OioSpin } from '../oio-spin';
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';

export default defineComponent({
  name: 'OioModal',
  components: {
    VanPopup,
    OioButton,
    OioSpin
  },
  inheritAttrs: false,
  props: {
    ...OioModalProps,
    width: {
      type: [Number, String] as PropType<ModalWidthType | string | number>,
      default: '90%'
    },
    height: {
      type: [Number, String]
    },
    popupMode: Boolean,
    wrapClassName: String,
    teleport: {
      type: [String, HTMLElement],
      default: 'body'
    }
  },
  slots: ['default', 'header', 'footer'],
  emits: ['update:visible', 'change'],
  setup(props, context) {
    const setupProps = useModal(props, context);
    function change(val) {
      context.emit('update:visible', val);
      context.emit('change', val);
    }

    function onCancel(e) {
      change(false);
      return setupProps.cancel(e);
    }

    function onOk(e) {
      change(false);
      return setupProps.enter(e);
    }
    const mainClassName = `${DEFAULT_PREFIX}-modal`;
    const classList = StringHelper.append([mainClassName], CastHelper.cast(context.attrs.class), props.wrapClassName);
    if (props.popupMode) {
      classList.push(`${mainClassName}-popup-mode`);
    }
    return {
      ...setupProps,
      width: StyleHelper.px(props.width),
      height: isNumber(props.height) ? StyleHelper.px(props.height) : props.height,
      zIndex: props.zIndex,
      change,
      onCancel,
      onOk,
      mainClassName,
      classList
    };
  }
});
</script>
