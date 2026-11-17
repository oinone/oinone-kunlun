<script lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { OioFormItem, PropRecordHelper } from '@oinone/kunlun-vue-ui-antd';
import { Tooltip as ATooltip } from 'ant-design-vue';
import {
  computed,
  createVNode,
  defineComponent,
  inject,
  onMounted,
  type Slot,
  vShow,
  watch,
  withDirectives
} from 'vue';
import { TABLE_VALIDATION_ROW_HEIGHT_KEY } from '../../view/table/validation-row-height';
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
    /**
     * 表格提供的行高调度。表格外复用本组件时没有 provide，直接跳过。
     */
    const scheduleSyncValidationRowHeight = inject<(() => void) | undefined>(
      TABLE_VALIDATION_ROW_HEIGHT_KEY,
      undefined
    );

    /**
     * 校验文案出现、变化或消失后，让表格重测这一行的高度。
     */
    const notifyValidationRowHeight = () => {
      scheduleSyncValidationRowHeight?.();
    };

    watch(
      () => props.validatorInfo?.message,
      () => {
        notifyValidationRowHeight();
      }
    );

    onMounted(() => {
      if (props.validatorInfo?.message) {
        notifyValidationRowHeight();
      }
    });

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
