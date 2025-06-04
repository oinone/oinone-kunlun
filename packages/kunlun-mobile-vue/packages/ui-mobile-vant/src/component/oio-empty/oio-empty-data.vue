<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioEmptyDataProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { Empty as VanEmpty } from 'vant';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioEmptyData',
  components: {
    VanEmpty
  },
  props: {
    ...OioEmptyDataProps
  },
  slots: ['image', 'description'],
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'image' }, { origin: 'description' }]);
    let { description } = this;
    if (!slots.description && !this.description) {
      description = this.$translate('暂无数据');
    }
    const componentProps = {
      image: this.image,
      description,
      ...this.$attrs,
      class: StringHelper.append([`${DEFAULT_PREFIX}-empty-data`], CastHelper.cast(this.$attrs.class))
    };
    return createVNode(VanEmpty, componentProps, slots);
  }
});
</script>
