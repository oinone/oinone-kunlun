<script lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { Popover as VanPopover } from 'vant';
import { computed, createVNode, defineComponent, type VNode, vShow, withDirectives } from 'vue';
import { DEFAULT_PREFIX } from '../../ui/theme';
import { BaseGalleryItemProps } from './props';

export default defineComponent({
  name: 'DefaultGalleryItem',
  components: {
    QuestionCircleOutlined,
    VanPopover
  },
  inheritAttrs: false,
  props: {
    ...BaseGalleryItemProps
  },
  setup(props) {
    const showLabel = computed(() => {
      if (props.labelInvisible) {
        return false;
      }
      return !!props.label;
    });

    const labelText = computed(() => {
      const { label } = props;
      if (typeof label === 'string') {
        return label;
      }
      return undefined;
    });

    const classes = computed(() => {
      return [`${DEFAULT_PREFIX}-gallery-common-item`, showLabel.value ? '' : 'gallery-common-item-hide-label'];
    });

    return {
      labelText,
      showLabel,
      classes
    };
  },
  render() {
    const children: VNode[] = [];
    if (this.showLabel) {
      const labelChildren: VNode[] = [
        createVNode('span', { class: 'gallery-common-item-label-content' }, this.labelText)
      ];
      if (this.help) {
        labelChildren.push(
          createVNode(
            VanPopover,
            {},
            {
              default: () => {
                if (typeof this.help !== 'string') {
                  return [this.help];
                }
                return [createVNode('span', { innerHTML: this.help })];
              },
              reference: () => {
                return [
                  createVNode(QuestionCircleOutlined, {
                    class: 'question-icon gallery-common-item-question-icon'
                  })
                ];
              }
            }
          )
        );
      }
      children.push(createVNode('div', { class: 'gallery-common-item-label', title: this.labelText }, labelChildren));
    }
    children.push(
      createVNode('div', { class: 'gallery-common-item-content' }, [
        ...(this.$slots.default?.() || []),
        ...(this.$slots.itemComponent?.() || [])
      ])
    );
    return withDirectives(createVNode('div', { class: this.classes }, children), [[vShow, !this.invisible]]);
  }
});
</script>
