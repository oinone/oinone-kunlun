<template>
  <van-popup
    :show="visible"
    :style="{ width }"
    :teleport="teleport"
    :class="classList"
    :overlay-class="wrapClassName"
    closeable
    :position="popupMode ? 'bottom' : 'center'"
    round
    safe-area-inset-bottom
    @open="change(true)"
    @close="onCancel"
  >
    <template #default>
      <slot name="header" v-if="$slots.title || title">
        <div class="van-dialog__header">
          <slot name="title">{{ title }}</slot>
        </div>
      </slot>
      <div class="van-dialog__content">
        <div class="van-dialog__message" :class="{'van-dialog__message--has-title' : $slots.title || title}">
          <slot>{{ message }}</slot>
        </div>
      </div>
      <div class="van-hairline--top van-dialog__footer">
        <button
          type="button"
          class="van-button van-button--default van-button--large van-dialog__cancel"
          @click="onCancel"
        >
          <div class="van-button__content">
            <span class="van-button__text">{{ cancelText || translate('kunlun.common.cancel') }}</span>
          </div>
        </button>
        <button
          type="button"
          class="van-button van-button--default van-button--large van-dialog__confirm van-hairline--left"
          @click="onOk"
        >
          <div class="van-button__content">
            <span class="van-button__text">{{ enterText || translate('kunlun.common.confirm') }}</span>
          </div>
        </button>
      </div>
    </template>
  </van-popup>
</template>
<script lang="ts">
import { ModalWidthType, OioModalProps, StyleHelper, useModal } from '@kunlun/vue-ui-common';
import { Popup as VanPopup } from 'vant';
import { defineComponent, PropType } from 'vue';
import { isNumber } from 'lodash-es';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioDialog',
  components: {
    VanPopup
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
    message: {
      type: String
    },
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
    const classList = [mainClassName, 'van-dialog'];
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
