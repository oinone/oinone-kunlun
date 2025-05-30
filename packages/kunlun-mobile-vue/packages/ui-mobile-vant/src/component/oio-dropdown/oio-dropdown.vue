<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  convertAntdDropdownPlacement,
  OioDropdownPlacement,
  OioDropdownProps,
  OioDropdownTrigger,
  PropRecordHelper
} from '@kunlun/vue-ui-common';
import { DropdownMenu as VanDropdownMenu, DropdownItem as VanDropdownItem } from 'vant';
import { isNil, isString } from 'lodash-es';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioDropdown',
  components: {
    VanDropdownMenu,
    VanDropdownItem
  },
  inheritAttrs: false,
  props: {
    ...OioDropdownProps
  },
  slots: ['default', 'overlay'],
  emits: ['update:value'],
  setup(props, context) {
    const value = ref<boolean>(false);
    const realValue = computed<boolean>({
      get() {
        if (props.value == null) {
          return value.value;
        }
        return props.value;
      },
      set(val: boolean) {
        value.value = val;
        context.emit('update:value', val);
      }
    });

    const trigger = computed<string[]>(() => {
      const triggers: string[] = [];
      const triggerProp = props.trigger;
      if (isNil(triggerProp)) {
        triggers.push(OioDropdownTrigger.click);
      } else if (isString(triggerProp)) {
        triggers.push(triggerProp);
      } else {
        for (const tgr of triggerProp) {
          triggers.push(tgr);
        }
      }
      return triggers;
    });

    const placement = computed<string | undefined>(() => {
      return convertAntdDropdownPlacement(props.placement as OioDropdownPlacement);
    });

    const onUpdateValue = (val: boolean) => {
      realValue.value = val;
    };

    return {
      realValue,
      trigger,
      placement,

      onUpdateValue
    };
  },
  render() {
    return createVNode(
      VanDropdownMenu,
      {
        visible: this.realValue,
        disabled: this.disabled,
        trigger: this.trigger,
        placement: this.placement,
        overlayStyle: this.overlayStyle,
        forceRender: this.forceRender,
        ...this.$attrs,
        class: StringHelper.append([`${DEFAULT_PREFIX}-dropdown`], CastHelper.cast(this.$attrs.class)),
        style: this.$attrs.style,
        'onUpdate:visible': this.onUpdateValue,
        overlayClassName: StringHelper.append(
          [`${DEFAULT_PREFIX}-dropdown-overlay`],
          CastHelper.cast(this.overlayClassName)
        ).join(' '),
        destroyPopupOnHide: this.destroyOnHide,
        getPopupContainer: this.getTriggerContainer
      },
      PropRecordHelper.collectionSlots(this.$slots, ['default', 'overlay'])
    );
  }
});
</script>
