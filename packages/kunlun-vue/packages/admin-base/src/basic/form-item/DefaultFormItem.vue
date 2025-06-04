<script lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { OioFormItem, PropRecordHelper } from '@oinone/kunlun-vue-ui-antd';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { computed, createVNode, defineComponent, Slot, VNode, vShow, withDirectives } from 'vue';
import { ValidatorStatus } from '../../typing';
import { BaseFormItemProps } from './props';

export default defineComponent({
  name: 'DefaultFormItem',
  components: {
    OioFormItem,
    ATooltip,
    QuestionCircleOutlined
  },
  inheritAttrs: false,
  props: {
    ...BaseFormItemProps,
    itemName: {
      type: String
    },
    labelInvisible: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const required = computed<boolean>(() => BooleanHelper.toBoolean(props.required) || false);

    return {
      required
    };
  },
  render() {
    const classList = ['form-field-widget', 'item'];
    const defaultSlots = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true }
    ]).default();
    const children: Record<string, Slot> = {
      default: () => {
        return [createVNode('div', { class: 'widget-container' }, defaultSlots)];
      }
    };
    if (this.labelInvisible) {
      classList.push('hide-ant-form-item-label');
    } else {
      children.label = () => {
        const label = translateValueByKey(this.label as string);
        const vnodes: VNode[] = [
          createVNode('span', { class: 'form-field-widget-label-content', title: label }, label)
        ];
        if (this.help) {
          vnodes.push(
            createVNode(
              ATooltip,
              { placement: 'top', overlayStyle: { maxWidth: '260px' } as CSSStyleDeclaration },
              {
                title: () => {
                  return [createVNode('span', {}, this.help)];
                },
                default: () => {
                  return [createVNode(QuestionCircleOutlined, { class: 'question-icon' })];
                }
              }
            )
          );
        }
        return vnodes;
      };
    }
    if (this.hint) {
      children.extra = () => {
        return [createVNode('span', { title: this.hint }, this.hint)];
      };
    }
    const validationMessage = this.validatorInfo?.message;
    if (validationMessage) {
      children.help = () => {
        return [createVNode('span', { class: 'form-field-error-msg', title: validationMessage }, validationMessage)];
      };
    }
    let validateStatus = this.validatorInfo?.status;
    if (validateStatus === ValidatorStatus.Skip) {
      validateStatus = undefined;
    }
    return withDirectives(
      createVNode(
        OioFormItem,
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, classList),
          colon: this.colon,
          layout: this.layout,
          required: this.required,
          validateTrigger: this.validateTrigger,
          validateStatus,
          'data-name': this.itemName
        },
        children
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
