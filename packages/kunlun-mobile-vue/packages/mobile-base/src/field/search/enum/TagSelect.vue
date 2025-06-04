<script lang="ts">
import { deepClone } from '@oinone/kunlun-meta';
import { OioSelect, SelectItem } from '@oinone/kunlun-vue-ui-mobile-vant';
import { Radio as ARadioButton, RadioGroup as ARadioGroup } from 'vant';
import { computed, createVNode, defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps, useInjectOioDefaultFormContext, useMetadataProps } from '../../../basic';

export default defineComponent({
  name: 'TagSelect',
  components: {
    OioSelect
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Boolean, Object],
      default: undefined
    },
    defaultValue: {
      type: [String, Boolean, Object],
      default: undefined
    },
    options: {
      type: Array
    },
    allowClear: {
      type: Boolean
    },
    placeholder: {
      type: String
    }
  },
  setup(props) {
    const { realValue, readonly, disabled } = useMetadataProps(props);
    const finalOptions = computed<SelectItem[]>(() => {
      if (!props.options) {
        return [];
      }
      const list = deepClone(props.options) as any[];
      for (const aElement of list) {
        if (aElement.name === 'false' || aElement.name === 'true') {
          aElement.name = JSON.parse(aElement.name);
          aElement.value = aElement.name;
        }
      }
      return list;
    });

    const formContext = useInjectOioDefaultFormContext();

    const selectChange = (val: SelectItem) => {
      realValue.value = val?.value;
      if (props.change) {
        props.change(val ? val.value : undefined);
      }
      props.blur && props.blur();
    };

    const onClickOption = (val: SelectItem) => {
      selectChange(val);
    };

    return {
      realValue,
      readonly,
      disabled,
      finalOptions,
      selectChange,
      onClickOption,
      getTriggerContainer: formContext.getTriggerContainer
    };
  },
  render() {
    const { disabled, realValue, finalOptions, onClickOption } = this;
    return createVNode(
      ARadioGroup,
      {
        class: 'mobile-tag-select search-tag-select',
        buttonStyle: 'solid',
        value: realValue,
        disabled
      },
      {
        default: () => {
          return finalOptions.map((option) => {
            return createVNode(
              ARadioButton,
              {
                class: 'tag-select-item search-tag-select-item',
                value: option.value,
                onClick: () => onClickOption(option)
              },
              {
                default: () => [createVNode('span', {}, option.label)]
              }
            );
          });
        }
      }
    );
  }
});
</script>
