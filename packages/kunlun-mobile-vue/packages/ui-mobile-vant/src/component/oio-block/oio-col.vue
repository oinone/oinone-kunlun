<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import { ColProps, OioColProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Col as VanCol } from 'vant';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioCol',
  components: {
    VanCol
  },
  inheritAttrs: false,
  props: {
    ...OioColProps
  },
  render() {
    const classList = [`${DEFAULT_PREFIX}-col`];
    if (this.fixed) {
      classList.push(`${DEFAULT_PREFIX}-col-fixed`);
    }

    const style = (this.$attrs.style || {}) as CSSStyleDeclaration;
    if (this.flex) {
      style.flex = this.flex as string;
    }
    return createVNode(
      VanCol,
      {
        ...PropRecordHelper.convert(ColProps, CastHelper.cast(this)),
        ...this.$attrs,
        style,
        class: StringHelper.append(classList, CastHelper.cast(this.$attrs.class))
      },
      PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }])
    );
  }
});
</script>
