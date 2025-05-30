<script lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { CastHelper, OioFormItem, PropRecordHelper } from '@kunlun/vue-ui-mobile-vant';
import { BooleanHelper } from '@kunlun/shared';
import { Popover as VanPopover } from 'vant';
import { computed, createVNode, defineComponent, Slot, VNode, vShow, withDirectives } from 'vue';
import { BaseFormItemProps } from './props';
import { ValidatorStatus } from '../../typing';

const DefaultFormItemProps = {
  ...BaseFormItemProps,
  itemName: {
    type: String
  },
  parentClass: {
    type: String,
    default: ''
  },
  labelInvisible: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fakeVertical: {
    type: Boolean,
    default: false
  },
  isLink: {
    type: Boolean,
    default: false
  },
  isAutoHeight: {
    type: Boolean,
    default: false
  },
  noBorderBottom: {
    type: Boolean,
    default: false
  },
  noPaddingTop: {
    type: Boolean,
    default: false
  },
  noShadow: {
    type: Boolean,
    default: false
  },
  fieldValueOverflowHidden: {
    type: Boolean,
    default: false
  },
  showAllowClear: {
    type: Boolean,
    default: false
  },
  clearValue: {
    type: Function
  }
};

export default defineComponent({
  name: 'DefaultFormItem',
  components: {
    OioFormItem,
    VanPopover,
    QuestionCircleOutlined
  },
  inheritAttrs: false,
  props: {
    ...DefaultFormItemProps
  },
  setup(props) {
    const required = computed<boolean>(() => BooleanHelper.toBoolean(props.required) || false);

    return {
      required
    };
  },
  render() {
    const classList = [this.parentClass, 'form-field-widget', 'item'];
    const defaultSlots = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true }
    ]).default();
    const children: Record<string, Slot> = {
      default: () => {
        return [createVNode('div', { class: 'widget-container' }, defaultSlots)];
      }
    };
    if (this.labelInvisible) {
      classList.push('hide-form-item-label');
    } else {
      children.label = () => {
        const vnodes: VNode[] = [
          createVNode('span', { class: 'form-field-widget-label-content', title: this.label }, this.label)
        ];
        if (this.help) {
          vnodes.push(
            createVNode(
              VanPopover,
              {},
              {
                default: () => {
                  return [createVNode('span', {}, this.help)];
                },
                reference: () => {
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
        return [createVNode('span', { title: validationMessage }, validationMessage)];
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
          ...PropRecordHelper.convert(DefaultFormItemProps, CastHelper.cast(this)),
          ...PropRecordHelper.collectionBasicProps(this.$attrs, classList),
          name: this.itemName || this.name,
          hideLabel: this.labelInvisible,
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
