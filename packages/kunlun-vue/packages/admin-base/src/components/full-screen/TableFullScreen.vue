<script lang="ts">
import { createVNode, defineComponent, PropType, withDirectives, vShow } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    onChange: {
      type: Function as PropType<(value: boolean) => void>,
      default: () => {}
    }
  },
  setup(props, ctx) {
    return {};
  },
  render() {
    return createVNode('div', { class: 'table-full-screen' }, [
      withDirectives(
        createVNode(OioIcon, {
          onClick: () => this.onChange(!this.value),
          icon: 'oinone-quanping'
        }),
        [[vShow, !this.value]]
      ),
      withDirectives(
        createVNode(OioIcon, {
          onClick: () => this.onChange(!this.value),
          icon: 'oinone-shousuo'
        }),
        [[vShow, this.value]]
      )
    ]);
  }
});
</script>
