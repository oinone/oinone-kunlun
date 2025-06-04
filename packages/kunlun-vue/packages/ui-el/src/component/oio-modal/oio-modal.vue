<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { ButtonType, OioModalProps, PropRecordHelper, useModal } from '@oinone/kunlun-vue-ui-common';
import { ElButton, ElDialog, ElLoadingDirective } from 'element-plus';
import { createVNode, defineComponent, withDirectives } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioModal',
  components: {
    ElDialog,
    ElButton
  },
  inheritAttrs: false,
  props: {
    ...OioModalProps
  },
  slots: ['default', 'header', 'footer', 'icon'],
  emits: ['update:visible'],
  setup(props, context) {
    return {
      ...useModal(props, context)
    };
  },
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      ['header', 'title'],
      {
        origin: 'footer',
        default: () => {
          return [
            createVNode(
              ElButton,
              {
                onClick: this.cancel
              },
              this.cancelText
            ),
            createVNode(
              ElButton,
              {
                type: ButtonType.primary,
                onClick: this.enter
              },
              this.enterText
            )
          ];
        }
      },
      'icon'
    ]);
    return withDirectives(
      createVNode(
        ElDialog,
        {
          title: this.title,
          width: this.width,
          draggable: this.draggable,
          showClose: true,
          closeOnClickModal: true,
          closeOnPressEscape: true,
          destroyOnClose: this.destroyOnClose,
          ...this.$attrs,
          class: StringHelper.append([`${DEFAULT_PREFIX}-modal`], CastHelper.cast(this.$attrs.class)),
          modelValue: this.visible,
          beforeClose: this.cancel
        },
        {
          ...slots,
          default: () => slots.default({ data: this.data })
        }
      ),
      [[ElLoadingDirective, this.loading]]
    );
  }
});
</script>
