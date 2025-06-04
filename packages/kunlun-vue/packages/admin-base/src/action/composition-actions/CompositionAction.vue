<script lang="ts">
import { CastHelper } from '@oinone/kunlun-shared';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-antd';
import { createVNode, defineComponent } from 'vue';
import DefaultAction from '../component/action/DefaultAction.vue';
import { ActionProps, useAction } from '../component/action/typing';

export default defineComponent({
  name: 'CompositionAction',
  components: {
    DefaultAction
  },
  inheritAttrs: false,
  props: {
    ...ActionProps
  },
  setup(props) {
    return {
      ...useAction(props)
    };
  },
  render() {
    return createVNode(DefaultAction, PropRecordHelper.convert(ActionProps, CastHelper.cast(this)), {
      default: () => {
        return createVNode('div', { class: 'composition-actions' }, this.$slots?.default?.() || []);
      }
    });
  }
});
</script>
<style lang="scss">
.composition-actions {
  display: none;
}
</style>
