<script lang="ts">
import { CSSStyle, CastHelper } from '@oinone/kunlun-shared';
import { ColProps, OioColProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { Col as ACol } from 'ant-design-vue';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioCol',
  components: {
    ACol
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
    return createVNode(
      ACol,
      {
        ...PropRecordHelper.convert(ColProps, CastHelper.cast(this)),
        ...PropRecordHelper.collectionBasicProps(this.$attrs, classList)
      },
      PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }])
    );
  }
});
</script>
