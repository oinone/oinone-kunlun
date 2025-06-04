<script lang="ts">
import { OioEmptyDataProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { Empty as AEmpty } from 'ant-design-vue';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioSpin } from '../oio-spin';

export default defineComponent({
  name: 'OioEmptyData',
  components: {
    AEmpty,
    OioSpin
  },
  props: {
    ...OioEmptyDataProps
  },
  slots: ['image', 'description'],
  render() {
    const { loading, loadingIndicator, wrapperClassName, image } = this;
    const slots = PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'image' }, { origin: 'description' }]);
    let { description } = this;
    if (!slots.description && !description) {
      description = this.$translate('暂无数据');
    }
    const componentProps = {
      ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-empty-data`]),
      image,
      description
    };
    const component = createVNode(AEmpty, componentProps, slots);
    if (loading == null) {
      return component;
    }
    return createVNode(
      OioSpin,
      {
        loading,
        loadingIndicator,
        wrapperClassName
      },
      {
        default: () => [component]
      }
    );
  }
});
</script>
