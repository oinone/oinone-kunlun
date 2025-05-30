<script lang="ts">
import { ViewType } from '@kunlun/meta';
import { CastHelper, StringHelper } from '@kunlun/shared';
import { DEFAULT_PREFIX } from '@kunlun/vue-ui-mobile-vant';
import { PropRecordHelper } from '@kunlun/vue-ui-common';
import { DslRenderDefinition } from '@kunlun/vue-widget';
import { createVNode, defineComponent, PropType, vShow, withDirectives } from 'vue';

export default defineComponent({
  name: 'DefaultView',
  inheritAttrs: false,
  props: {
    currentHandle: {
      type: String
    },
    template: {
      type: Object as PropType<DslRenderDefinition>
    },
    viewType: {
      type: String as PropType<ViewType>
    },
    inline: {
      type: Boolean,
      default: false
    },
    invisible: {
      type: Boolean,
      default: false
    },
    noActionBar: {
      type: Boolean,
      default: false
    }
  },
  render() {
    const { viewType, currentHandle } = this;
    const classList: string[] = [`${DEFAULT_PREFIX}-default-view`];
    if (viewType) {
      classList.push(`${DEFAULT_PREFIX}-default-${viewType.toLowerCase()}-view`);
    }
    if (this.inline) {
      classList.push(`${DEFAULT_PREFIX}-default-view-inline`);
    }
    if (this.noActionBar) {
      classList.push(`${DEFAULT_PREFIX}-default-view-no-action-bar`);
    }
    return withDirectives(
      createVNode(
        'div',
        {
          id: currentHandle,
          ...PropRecordHelper.collectionBasicProps(
            this.$attrs,
            StringHelper.append(classList, CastHelper.cast(this.template?.class)),
            CastHelper.cast(this.template?.style)
          )
        },
        { default: () => this.$slots.default?.() }
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
