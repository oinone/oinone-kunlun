<script lang="ts">
import { createVNode, defineComponent, PropType, vShow, withDirectives } from 'vue';
import { ViewType } from '@oinone/kunlun-meta';
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { PropRecordHelper, StableSlotProp } from '@oinone/kunlun-vue-ui-common';
import { DslRenderDefinition } from '@oinone/kunlun-vue-widget';
import { isMinimalismTheme } from '@oinone/kunlun-engine';
import { ViewBizStyle } from '../../typing';

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
    fullScreen: {
      type: Boolean,
      default: false
    },
    bizStyle: {
      type: String as PropType<ViewBizStyle>
    }
  },
  render() {
    const { viewType, currentHandle, fullScreen, bizStyle } = this;
    const classList: string[] = [`${DEFAULT_PREFIX}-default-view`];
    if (viewType) {
      classList.push(`${DEFAULT_PREFIX}-default-${viewType.toLowerCase()}-view`);
    }
    if (this.inline) {
      classList.push(`${DEFAULT_PREFIX}-default-view-inline`);
    }
    if (fullScreen) {
      classList.push(`${DEFAULT_PREFIX}-full-screen-view`);
    }

    if (bizStyle) {
      classList.push(`${DEFAULT_PREFIX}-default-${bizStyle.toLowerCase()}-view`);
    } else if (isMinimalismTheme() && !this.inline && viewType !== ViewType.Search) {
      classList.push(`${DEFAULT_PREFIX}-default-minimalism-view`);
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
        {
          ...StableSlotProp,
          default: () => [
            createVNode('div', { class: `${DEFAULT_PREFIX}-default-view-container` }, this.$slots.default?.())
          ]
        }
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
