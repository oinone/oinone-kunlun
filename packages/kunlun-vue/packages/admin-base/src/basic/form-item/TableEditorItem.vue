<script lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BooleanHelper } from '@kunlun/shared';
import { OioFormItem, PropRecordHelper } from '@kunlun/vue-ui-antd';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { computed, createVNode, defineComponent, Slot, vShow, withDirectives } from 'vue';
import { BaseFormItemProps } from './props';

export default defineComponent({
  name: 'TableEditorItem',
  components: {
    OioFormItem,
    ATooltip,
    QuestionCircleOutlined
  },
  inheritAttrs: false,
  props: {
    ...BaseFormItemProps
  },
  setup(props) {
    const required = computed<boolean>(() => BooleanHelper.toBoolean(props.required) || false);

    return {
      required
    };
  },
  render() {
    const classList = ['default-table-editor-item', 'form-field-widget', 'item', 'hide-ant-form-item-label'];
    const defaultSlots = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true }
    ]).default();
    const children: Record<string, Slot> = {
      default: () => {
        return [createVNode('div', { class: 'widget-container' }, defaultSlots)];
      }
    };
    const validationMessage = this.validatorInfo?.message;
    if (validationMessage) {
      children.help = () => {
        return [createVNode('span', { title: validationMessage }, validationMessage)];
      };
    }
    return withDirectives(
      createVNode(
        OioFormItem,
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, classList),
          name: this.name,
          colon: this.colon,
          layout: this.layout,
          required: this.required,
          validateTrigger: this.validateTrigger,
          validateStatus: this.validatorInfo?.status,
          'data-name': this.name
        },
        children
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
