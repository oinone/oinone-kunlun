<script lang="ts">
import { CastHelper, CSSStyle, StringHelper } from '@kunlun/shared';
import {
  OioTabPosition,
  OioTabsProps,
  PropRecordHelper,
  StyleHelper,
  useProviderOioTabsContext
} from '@kunlun/vue-ui-common';
import { Tabs as VanTabs } from 'vant';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

const tabsProps = {
  ...OioTabsProps,
  // 是否开启手势左右滑动切换
  swipeable: {
    type: Boolean
  },
  // 是否开启滚动导航
  scrollspy: {
    type: Boolean
  },
  // 是否开启延迟渲染（首次切换到标签时才触发内容渲染）
  lazyRender: {
    type: Boolean,
    default: true
  },
  // 滚动阈值，标签数量超过阈值且总宽度超过标签栏宽度时开始横向滚动
  swipeThreshold: {
    type: Number,
    default: 4
  }
};
export default defineComponent({
  name: 'OioTabs',
  components: {
    VanTabs
  },
  inheritAttrs: false,
  props: {
    ...tabsProps
  },
  slots: ['default', 'tabBarExtraContent'],
  emits: ['update:active-key', 'change'],
  setup(props, context) {
    const onUpdateActiveKey = (val) => {
      // context.emit('update:active-key', val);
      context.emit('change', val);
    };

    useProviderOioTabsContext({
      tabPosition: computed(() => props.tabPosition)
    });

    return {
      onUpdateActiveKey
    };
  },
  render() {
    const style = {} as CSSStyle;
    const { tabPosition, verticalHeight } = this;
    if (tabPosition !== OioTabPosition.TOP) {
      if (!isNil(verticalHeight)) {
        style.height = StyleHelper.px(verticalHeight) as string;
      }
    }
    const classes = StringHelper.append(
      [`${DEFAULT_PREFIX}-tabs`, `${DEFAULT_PREFIX}-tabs-${tabPosition}`],
      CastHelper.cast(this.$attrs.class)
    );
    return createVNode(
      VanTabs,
      {
        ...PropRecordHelper.convert(tabsProps, CastHelper.cast(this)),
        // animated、swipeable属性会改变dom结构
        // animated: true,
        // swipeable: tabPosition === OioTabPosition.TOP,
        onChange: this.onUpdateActiveKey,
        ...this.$attrs,
        class: classes,
        style: {
          ...style,
          ...((this.$attrs.style || {}) as CSSStyleDeclaration)
        }
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        {
          origin: 'default',
          isNotNull: true
        }
      ])
    );
  }
});
</script>
