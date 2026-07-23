<script lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { computed, createVNode, defineComponent, type VNode, vShow, withDirectives } from 'vue';
import { BaseGalleryItemProps } from './props';

export default defineComponent({
  name: 'DefaultGalleryItem',
  components: {
    ATooltip,
    QuestionCircleOutlined
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

    return {
      labelText,
      showLabel
    };
  },
  render() {
    const classList = [
      'gallery-common-item',
      !this.showLabel && 'gallery-common-item-hide-label',
      this.layout && `gallery-common-item-${this.layout}`
    ];
    const children: VNode[] = [];
    if (this.showLabel) {
      const labelChildren: VNode[] = [
        createVNode('span', { class: 'gallery-common-item-label-content' }, this.labelText)
      ];
      if (this.help) {
        labelChildren.push(
          createVNode(
            ATooltip,
            { placement: 'top', overlayStyle: { maxWidth: '260px' } },
            {
              title: () => {
                if (typeof this.help !== 'string') {
                  return [this.help];
                }
                return [createVNode('span', { innerHTML: this.help })];
              },
              default: () => {
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
    return withDirectives(createVNode('div', { class: classList }, children), [[vShow, !this.invisible]]);
  }
});
</script>
