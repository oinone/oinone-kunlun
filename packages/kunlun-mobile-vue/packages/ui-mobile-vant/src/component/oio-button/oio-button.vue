<script lang="ts">
import { CastHelper } from '@kunlun/shared';
import {
  ButtonSize,
  IconPlacement,
  OioButtonProps,
  OioIcon,
  PropRecordHelper
} from '@kunlun/vue-ui-common';
import { Button as VanButton } from 'vant';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioButton',
  components: {
    VanButton,
    OioIcon
  },
  inheritAttrs: false,
  props: {
    ...OioButtonProps
  },
  slots: ['default', 'icon'],
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      'icon'
    ]);
    if (!slots.icon && this.icon) {
      slots.icon = () => [createVNode(OioIcon, { icon: this.icon })];
    }
    const buttonClassList = [`${DEFAULT_PREFIX}-button`, `${DEFAULT_PREFIX}-button-${this.type}`];
    if (this.bizStyle) {
      buttonClassList.push(`${DEFAULT_PREFIX}-button-biz-type-${this.bizStyle}`);
    }
    const defaultSlot = slots.default?.() || [];
    if (slots.icon) {
      if (defaultSlot.length === 0) {
        buttonClassList.push(`${DEFAULT_PREFIX}-button-icon-only`);
      } else {
        buttonClassList.push(`${DEFAULT_PREFIX}-button-icon-${this.iconPlacement}`);
      }
    }
    // 兼容移动端的buttonSize
    const sizeMap = {
      [ButtonSize.middle]: 'normal'
    };
    const children = { default: () => defaultSlot } as any;
    if (this.iconPlacement && slots.icon) {
      children.icon = () => slots.icon?.();
    }
    return createVNode(
      VanButton,
      {
        ...PropRecordHelper.convert(OioButtonProps, CastHelper.cast(this)),
        ...this.$attrs,
        ...PropRecordHelper.collectionBasicProps(this.$attrs, buttonClassList),
        size: sizeMap[this.size] || this.size,
        iconPosition: this.iconPlacement === IconPlacement.BEFORE ? 'left' : 'right'
      },
      children
    );
  }
});
</script>
