<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import { convertAntdTooltipPlacement, OioTooltipProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioTooltip',
  components: {
    ATooltip
  },
  inheritAttrs: false,
  props: {
    ...OioTooltipProps
  },
  slots: ['default', 'title'],
  emits: ['update:visible'],
  setup(props, context) {
    const placement = computed<string | undefined>(() => {
      return convertAntdTooltipPlacement(props.placement);
    });

    const onUpdateVisible = (val: boolean) => {
      if (props.disabled) {
        return;
      }
      context.emit('update:visible', val);
    };

    return {
      placement,
      onUpdateVisible
    };
  },
  render() {
    const componentProps: Record<string, unknown> = {
      title: this.title,
      trigger: this.trigger,
      placement: this.placement,
      overlayStyle: this.overlayStyle,
      ...this.$attrs,
      destroyTooltipOnHide: this.destroyOnHide,
      'onUpdate:visible': this.onUpdateVisible,
      class: StringHelper.append([`${DEFAULT_PREFIX}-tooltip`], CastHelper.cast(this.$attrs.class)),
      overlayClassName: StringHelper.append(
        [`${DEFAULT_PREFIX}-tooltip-overlay`],
        CastHelper.cast(this.overlayClassName)
      ).join(' ')
    };
    if (this.disabled) {
      componentProps.visible = false;
    } else if (this.visible !== undefined) {
      componentProps.visible = this.visible;
    }
    return createVNode(ATooltip, componentProps, PropRecordHelper.collectionSlots(this.$slots, ['default', 'title']));
  }
});
</script>
