<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { convertAntdTooltipPlacement, OioTooltipProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
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
      ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-tooltip`]),
      destroyTooltipOnHide: this.destroyOnHide,
      'onUpdate:open': this.onUpdateVisible,
      overlayClassName: StringHelper.append(
        [`${DEFAULT_PREFIX}-tooltip-overlay`],
        CastHelper.cast(this.overlayClassName)
      ).join(' ')
    };
    if (this.disabled) {
      componentProps.open = false;
    } else if (this.visible !== undefined) {
      componentProps.open = this.visible;
    }
    return createVNode(ATooltip, componentProps, PropRecordHelper.collectionSlots(this.$slots, ['default', 'title']));
  }
});
</script>
