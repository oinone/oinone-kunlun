<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  FlexDirection,
  LayoutHelper,
  OioBlockProps,
  PropRecordHelper,
  StandardGutterType,
} from '@kunlun/vue-ui-common';
import { isNil, isNumber, isString, toString } from 'lodash-es';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioBlock',
  inheritAttrs: false,
  props: {
    ...OioBlockProps
  },
  render() {
    const blockClassList: string[] = [`${DEFAULT_PREFIX}-block`];
    let style = this.$attrs.style as CSSStyleDeclaration;
    if (!style) {
      style = {} as CSSStyleDeclaration;
    }
    if (this.flex) {
      blockClassList.push(`${DEFAULT_PREFIX}-block-flex`);
      if (this.inline) {
        blockClassList.push(`${DEFAULT_PREFIX}-block-inline-flex`);
      }
      if (this.flexDirection === FlexDirection.Column) {
        blockClassList.push(`${DEFAULT_PREFIX}-block-flex-direction-column`);
      }
      let { gutter } = this;
      let standardGutter: StandardGutterType;
      if (gutter) {
        if (isNumber(gutter)) {
          gutter = toString(gutter);
        }
        if (isString(gutter)) {
          standardGutter = LayoutHelper.convertGutter(gutter);
        } else {
          standardGutter = gutter;
        }
        let needSetRowGap = false;
        let needSetColumnGap = false;
        if (isNil(style.rowGap)) {
          needSetRowGap = true;
        }
        if (isNil(style.columnGap)) {
          needSetColumnGap = true;
        }
        if (isNil(style.gap) && needSetRowGap && needSetColumnGap) {
          style.gap = `${standardGutter[0]}px ${standardGutter[1]}px`;
        } else {
          if (needSetRowGap) {
            style.rowGap = `${standardGutter[0]}px`;
          }
          if (needSetColumnGap) {
            style.columnGap = `${standardGutter[1]}px`;
          }
        }
      }
    } else if (this.inline) {
      blockClassList.push(`${DEFAULT_PREFIX}-block-inline`);
    }
    return createVNode(
      'div',
      {
        class: StringHelper.append(blockClassList, CastHelper.cast(this.$attrs.class)),
        style
      },
      PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }])
    );
  }
});
</script>
