<script lang="ts">
import { isMinimalismTheme } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { PropRecordHelper, StableSlotProp } from '@oinone/kunlun-vue-ui-common';
import { useOioState } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, type PropType, vShow, withDirectives } from 'vue';
import { ViewBizStyle } from '../../typing';

export default defineComponent({
  name: 'DefaultView',
  inheritAttrs: false,
  props: {
    currentHandle: {
      type: String
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
    bizStyle: {
      type: String as PropType<ViewBizStyle>
    }
  },
  setup(props) {
    const { globalState, viewState } = useOioState(props.currentHandle!);

    return {
      fullScreen: computed(() => {
        if (props.inline) {
          return !!viewState?.fullscreen;
        }
        return viewState?.fullscreen || globalState.fullscreen;
      })
    };
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

    // 全屏
    if (fullScreen) {
      classList.push(`${DEFAULT_PREFIX}-full-screen-view`);
    }

    // 视图风格
    if (bizStyle) {
      if (bizStyle === ViewBizStyle.COMPACT) {
        classList.push(`${DEFAULT_PREFIX}-default-minimalism-view`);
      }
      classList.push(`${DEFAULT_PREFIX}-default-${bizStyle.toLowerCase()}-view`);
    } else if (isMinimalismTheme() && !this.inline && viewType !== ViewType.Search) {
      classList.push(`${DEFAULT_PREFIX}-default-minimalism-view`);
    }

    return withDirectives(
      createVNode(
        'div',
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, classList),
          id: currentHandle
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
