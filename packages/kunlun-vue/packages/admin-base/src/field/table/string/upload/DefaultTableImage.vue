<script lang="ts">
import { Image as AImage } from 'ant-design-vue';
import { createVNode, defineComponent, withModifiers } from 'vue';

export default defineComponent({
  name: 'DefaultTableImage',
  inheritAttrs: false,
  props: {
    currentValue: {
      type: String
    }
  },
  render() {
    const { currentValue } = this;
    if (!currentValue) {
      return [];
    }
    return createVNode(
      'span',
      {
        class: 'default-table-image',
        title: currentValue,
        onClick: withModifiers(() => {}, ['stop'])
      },
      [createVNode(AImage, { src: currentValue }, { default: () => currentValue })]
    );
  }
});
</script>

<style lang="scss">
.default-table-image {
  .ant-image {
    height: 100%;
    width: calc(var(--oio-table-tr-height) - 8px);

    .ant-image-mask-info {
      font-size: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      .anticon {
        display: block;
        font-size: 14px;
        margin: 0;
      }
    }
  }
}
</style>
