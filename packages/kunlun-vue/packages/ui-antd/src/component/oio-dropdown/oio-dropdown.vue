<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  convertAntdDropdownPlacement,
  OioDropdownPlacement,
  OioDropdownProps,
  OioDropdownTrigger,
  PropRecordHelper
} from '@kunlun/vue-ui-common';
import { Dropdown as ADropdown } from 'ant-design-vue';
import { isNil, isString } from 'lodash-es';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioDropdown',
  components: {
    ADropdown
  },
  inheritAttrs: false,
  props: {
    ...OioDropdownProps
  },
  slots: ['default', 'overlay'],
  emits: ['update:value'],
  setup(props, context) {
    const trigger = computed<string[]>(() => {
      const triggers: string[] = [];
      const triggerProp = props.trigger;
      if (isNil(triggerProp)) {
        triggers.push(OioDropdownTrigger.hover);
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
      context.emit('update:value', val);
    };

    return {
      trigger,
      placement,

      onUpdateValue
    };
  },
  render() {
    const componentData: Record<string, unknown> = {
      ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-dropdown`]),
      disabled: this.disabled,
      trigger: this.trigger,
      placement: this.placement,
      overlayStyle: this.overlayStyle,
      forceRender: this.forceRender,
      destroyPopupOnHide: this.destroyOnHide,
      getPopupContainer: this.getTriggerContainer,
      'onUpdate:visible': () => {},
      onVisibleChange: this.onUpdateValue,
      overlayClassName: StringHelper.append(
        [`${DEFAULT_PREFIX}-dropdown-overlay`],
        CastHelper.cast(this.overlayClassName)
      ).join(' ')
    };
    if (this.value != null) {
      componentData.visible = this.value;
    }
    return createVNode(ADropdown, componentData, PropRecordHelper.collectionSlots(this.$slots, ['default', 'overlay']));
  }
});
</script>
