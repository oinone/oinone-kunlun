<script lang="ts">
import { OioTableScope } from '@oinone/kunlun-vue-ui';
import { hasActionBarViewState, useOioState } from '@oinone/kunlun-vue-widget';
import { createVNode, defineComponent, onBeforeMount, onMounted } from 'vue';

let id = 0;

export default defineComponent({
  name: 'DefaultTableClickContainer',
  inheritAttrs: false,
  setup() {
    const handle = `table-click-container-${id++}`;

    const { viewState } = useOioState();

    onBeforeMount(() => {
      if (viewState) {
        const slotName = OioTableScope.click;
        viewState.__position.push({ handle, slotName });
        if (hasActionBarViewState(viewState)) {
          let { actionBars } = viewState;
          if (!actionBars) {
            actionBars = {};
            viewState.actionBars = actionBars;
          }
          if (!actionBars[slotName]) {
            actionBars[slotName] = viewState.createActionBarState({ handle });
          }
        }
      }
    });

    onMounted(() => {
      if (viewState) {
        const index = viewState.__position.findIndex((v) => v.handle === handle);
        if (index !== -1) {
          viewState.__position.splice(index, 1);
        }
      }
    });

    return {};
  },
  render() {
    return createVNode('div', { class: 'table-container-click' }, this.$slots.default?.());
  }
});
</script>
