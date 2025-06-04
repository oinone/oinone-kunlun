<template>
  <a-modal
    class="expression-dialog oio-modal"
    centered
    :mask-closable="maskClosable"
    :class="dialogClass"
    :closable="!!title"
    :width="width"
    :visible="visible"
    :title="$translate(title)"
    :footer="footer"
    :z-index="zIndex"
    :destroy-on-close="destroyOnClose"
    @cancel="onHandleCancel"
  >
    <template #closeIcon>
      <oio-close-icon />
    </template>
    <slot></slot>

    <template #footer>
      <slot name="footer">
        <oio-button class="cancel-btn" v-if="footer !== null" @click="onHandleCancel">{{
          translateExpValue('取消')
        }}</oio-button>
        <oio-button class="ok-btn" v-if="footer !== null" type="primary" @click="onHandleOk">{{
          translateExpValue('确定')
        }}</oio-button>
      </slot>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Modal } from 'ant-design-vue';
import { OioButton, OioCloseIcon } from '@oinone/kunlun-vue-ui-antd';
import { translateExpValue } from '../../share';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
      default: ''
    },
    dialogClass: String,
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    width: {
      type: [Number, String],
      required: false,
      default: 520
    },
    footer: {
      type: String,
      required: false
    },
    destroyOnClose: {
      type: Boolean,
      required: false,
      default: false
    },
    maskClosable: {
      type: Boolean,
      required: false,
      default: true
    },
    zIndex: {
      type: Number,
      default: undefined
    }
  },

  components: { AModal: Modal, OioButton, OioCloseIcon },

  emits: ['cancel', 'ok'],

  setup(props, { emit }) {
    const onHandleCancel = () => {
      emit('cancel');
    };

    const onHandleOk = () => {
      emit('ok');
    };

    return { onHandleCancel, onHandleOk, translateExpValue };
  }
});
</script>
