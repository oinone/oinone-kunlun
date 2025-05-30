<template>
  <div class="control-tag" :class="`control-tag-${size}`">
    <span class="control-tag-inner">
      <slot name="prefix" v-if="$slots.prefix" />
      <span class="control-tag-content">
        <slot>
          <span class="control-tag-content-title" :title="title + `${desc ? ' | ' + desc : ''}`">{{ title }}</span>
          <span v-if="desc" class="control-tag-content-desc" :title="desc">
            <a-divider type="vertical" />{{ desc }}
          </span>
        </slot>
      </span>
      <span v-if="closable" class="control-tag-close-btn" @click.stop="onClose">
        <close-circle-outlined class="ant-input-clear-icon" />
      </span>
      <slot name="addOn" v-if="$slots.addOn" />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CloseCircleOutlined } from '@ant-design/icons-vue';
import { ElementSize } from '../../../types';

export default defineComponent({
  components: { CloseCircleOutlined },

  props: {
    title: {
      type: String
    },
    desc: {
      type: String
    },
    closable: {
      type: Boolean,
      default: false
    },
    size: {
      type: String as PropType<ElementSize>,
      default: ElementSize.MIDDLE
    }
  },

  emits: ['close'],

  setup(props, { emit }) {
    const onClose = () => {
      emit('close');
    };
    return { onClose };
  }
});
</script>
