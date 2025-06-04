<template>
  <div class="default-keyboard-input">
    <oio-input
      :placeholder="placeholder"
      :value="displayValue"
      :allow-clear="true"
      @update:value="change"
      @blur="blur"
      @focus="focus"
      @keydown.prevent.stop="onKeydown"
    />
  </div>
</template>
<script lang="ts">
import { EventCategory } from '@oinone/kunlun-event';
import { KeyboardEventHelper } from '@oinone/kunlun-shared';
import { OioInput } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent } from 'vue';
import { OioCommonProps } from '../../../../basic';

export default defineComponent({
  name: 'DefaultKeyboardInput',
  components: {
    OioInput
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    value: {
      type: String
    },
    displayValue: {
      type: String
    },
    placeholder: {
      type: String
    },
    onKeypress: {
      type: Function
    }
  },
  setup(props) {
    const onKeydown = (ev: KeyboardEvent) => {
      if (props.onKeypress) {
        const helper = KeyboardEventHelper.newInstance(ev);
        if (helper.isStateKey()) {
          return;
        }
        props.onKeypress({
          category: EventCategory.html,
          type: 'keydown',
          origin: ev,
          code: ev.code,
          key: ev.key,
          ctrl: helper.isPressCtrl(),
          alt: helper.isPressAlt(),
          shift: helper.isPressShift()
        });
      }
    };

    return {
      onKeydown
    };
  }
});
</script>
<style lang="scss">
.default-keyboard-input {
}
</style>
