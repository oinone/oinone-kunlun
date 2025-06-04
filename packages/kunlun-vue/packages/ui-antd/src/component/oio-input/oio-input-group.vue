<script lang="ts">
import { OioInputGroupProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { InputGroup as AInputGroup } from 'ant-design-vue';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioInputGroup',
  components: {
    AInputGroup
  },
  inheritAttrs: false,
  props: {
    ...OioInputGroupProps
  },
  slots: ['default'],
  setup(props) {
    const compact = computed<boolean>(() => {
      if (props.compact == null) {
        return true;
      }
      return props.compact;
    });

    return {
      compact
    };
  },
  render() {
    return createVNode(
      AInputGroup,
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-input-group`]),
        compact: this.compact
      },
      this.$slots.default?.() || []
    );
  }
});
</script>
