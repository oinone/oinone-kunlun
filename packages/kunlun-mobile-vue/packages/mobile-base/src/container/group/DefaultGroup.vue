<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  FormLayout,
  OioGroup,
  PropRecordHelper,
  StyleHelper,
  useInjectOioFormContext,
  useProviderOioFormContext,
  DEFAULT_PREFIX
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { computed, createVNode, defineComponent, PropType, Slot, vShow, withDirectives } from 'vue';
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
    }
  },
  setup(props) {
    const formContext = useInjectOioFormContext();

    const layout = computed(() => {
      return props.layout || formContext.layout.value;
    });

    useProviderOioFormContext({
      ...formContext,
      layout
    });

    return {};
  },
  render() {
    const { $attrs, $slots, template, title, description, help, invisible, titleToolbarInvisible, border } = this;
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
          ...PropRecordHelper.collectionBasicProps(
            $attrs,
            StringHelper.append([`${DEFAULT_PREFIX}-default-group`], CastHelper.cast(template?.class)),
            CastHelper.cast(template?.style)
          ),
          title: !title && titleToolbarInvisible ? false : title,
          description,
          border,
          wrapperClassName: StringHelper.append([], CastHelper.cast(template?.wrapperClassName)),
          wrapperStyle: StyleHelper.parse(template?.wrapperStyle),
          toolbarClassName: StringHelper.append([], CastHelper.cast(template?.toolbarClassName)),
          toolbarStyle: StyleHelper.parse(template?.toolbarStyle),
          help
        },
        children
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
