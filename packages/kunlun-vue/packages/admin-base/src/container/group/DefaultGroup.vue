<script lang="ts">
import type { DslDefinition } from '@oinone/kunlun-dsl';
import { translateValueByKey } from '@oinone/kunlun-engine';
import type { CSSStyle } from '@oinone/kunlun-shared';
import { FormLayout, OioGroup, PropRecordHelper, useOioFormLayoutContext } from '@oinone/kunlun-vue-ui-antd';
import { createVNode, defineComponent, type PropType, type Slot, vShow, withDirectives } from 'vue';
import { defaultFlexResolve } from '../../tags/resolve/helper';
import DefaultGroupTitleToolbar from './DefaultGroupTitleToolbar.vue';

export default defineComponent({
  name: 'DefaultGroup',
  components: {
    OioGroup
  },
  inheritAttrs: false,
  props: {
    template: {
      type: Object as PropType<DslDefinition>
    },
    title: {
      type: String,
      default: translateValueByKey('分组')
    },
    description: {
      type: String,
      default: ''
    },
    help: {
      type: String
    },
    layout: {
      type: [String, Object] as PropType<FormLayout>
    },
    invisible: {
      type: Boolean,
      default: false
    },
    titleToolbarInvisible: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: true
    },
    bizStyle: {
      type: String
    },
    wrapperClassName: {
      type: [String, Array] as PropType<string | string[]>
    },
    wrapperStyle: {
      type: [String, Object] as PropType<string | CSSStyle>
    },
    toolbarClassName: {
      type: [String, Array] as PropType<string | string[]>
    },
    toolbarStyle: {
      type: [String, Object] as PropType<string | CSSStyle>
    }
  },
  setup(props) {
    useOioFormLayoutContext(props);

    return {};
  },
  render() {
    const {
      $attrs,
      $slots,
      template,
      title,
      description,
      help,
      invisible,
      titleToolbarInvisible,
      border,
      bizStyle,
      wrapperClassName,
      wrapperStyle,
      toolbarClassName,
      toolbarStyle
    } = this;
    const { default: defaultSlot, titleToolbar: titleToolbarSlot } = PropRecordHelper.collectionSlots($slots, [
      { origin: 'default', isNotNull: true },
      'titleToolbar'
    ]);
    const defaultChildren = defaultFlexResolve(template, defaultSlot);
    const children: Record<string, Slot> = {
      default: () => defaultChildren
    };
    if (titleToolbarSlot) {
      children.titleToolbar = () => [createVNode(DefaultGroupTitleToolbar, {}, { default: titleToolbarSlot })];
    }
    return withDirectives(
      createVNode(
        OioGroup,
        {
          ...PropRecordHelper.collectionBasicProps($attrs, ['oio-default-group']),
          title: !title && titleToolbarInvisible ? false : title,
          bizStyle,
          description,
          border,
          wrapperClassName,
          wrapperStyle,
          toolbarClassName,
          toolbarStyle,
          help
        },
        children
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
<style lang="scss">
.oio-default-group {
  width: 100%;
  display: flex;
  flex-direction: column;

  .oio-group-content {
    flex: auto;
  }
}
</style>
