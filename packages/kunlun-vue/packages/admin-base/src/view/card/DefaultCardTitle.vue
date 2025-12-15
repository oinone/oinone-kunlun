<script lang="ts">
import { OioCardScope, useInjectOioCardContext, useProviderOioCardContext } from '@oinone/kunlun-vue-ui-common';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DefaultCardTitle',
  components: {},
  inheritAttrs: false,
  props: {},
  setup(props) {
    const cardContext = useInjectOioCardContext();

    useProviderOioCardContext({
      ...cardContext,
      scope: OioCardScope.title
    });

    return {};
  },
  render() {
    return this.$slots.default?.();
  }
});
</script>
<style lang="scss"></style>
