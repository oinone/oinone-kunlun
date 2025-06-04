<script lang="ts">
import { CSSStyle, NumberHelper } from '@oinone/kunlun-shared';
import { isNil } from 'lodash-es';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { PropRecordHelper } from '../../util';
import { OioShapeProps } from './props';

export default defineComponent({
  name: 'OioShape',
  inheritAttrs: false,
  props: {
    ...OioShapeProps
  },
  slots: ['default'],
  render() {
    const { radius } = this;
    let { width, height } = this;
    if (!width) {
      width = this.size;
    }
    if (!height) {
      height = this.size;
    }
    const style = {} as CSSStyle;
    style[`--${DEFAULT_PREFIX}-shape-size`] = this.size;
    style[`--${DEFAULT_PREFIX}-shape-width`] = width;
    style[`--${DEFAULT_PREFIX}-shape-height`] = height;
    style[`--${DEFAULT_PREFIX}-shape-color`] = this.color;
    const rotateNumber = NumberHelper.toNumber(this.rotate);
    if (!isNil(rotateNumber)) {
      style.transform = `rotate(${rotateNumber}deg)`;
    }
    if (!isNil(radius)) {
      style.borderRadius = radius;
    }
    const classList = [`${DEFAULT_PREFIX}-shape`, `${DEFAULT_PREFIX}-shape-${this.type}`];
    if (this.block) {
      classList.push(`${DEFAULT_PREFIX}-shape-block`);
    }
    return createVNode(
      'span',
      PropRecordHelper.collectionBasicProps(this.$attrs, classList, style),
      PropRecordHelper.collectionSlots(this.$slots, ['default'])
    );
  }
});
</script>
