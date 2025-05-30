<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  defaultSelectProperties,
  fillSelectItemProperties,
  OioSelectProps,
  PropRecordHelper,
  SelectProperties,
  SelectItem
} from '@kunlun/vue-ui-common';
import { Select as ASelect } from 'ant-design-vue';
import { isString } from 'lodash-es';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioSelect',
  components: {
    ASelect
  },
  inheritAttrs: false,
  props: {
    ...OioSelectProps
  },
  slots: ['dropdownRender', 'removeIcon', 'clearIcon', 'suffixIcon', 'menuItemSelectedIcon'],
  emits: ['update:value'],
  setup(props) {
    const internalProperties = computed<SelectProperties>(() => {
      return {
        ...defaultSelectProperties,
        ...(props.properties || {})
      };
    });

    const internalOptions = computed<SelectItem[]>(() => {
      if (props.mappingOptions) {
        const options: SelectItem[] = [];
        props.options?.forEach((value, index) => {
          const option = fillSelectItemProperties(value, index, internalProperties.value, props.customFillProperties);
          if (option) {
            options.push(option);
          }
        });
        return options;
      }
      return CastHelper.cast(props.options || []);
    });

    const internalValue = computed<SelectItem | undefined>(() => {
      const { value } = props;
      if (value == null) {
        return undefined;
      }
      if (isString(value)) {
        return internalOptions.value.find((v) => v.key === value);
      }
      return value;
    });

    return {
      internalProperties,
      internalOptions,
      internalValue
    };
  },
  render() {
    return createVNode(
      ASelect,
      {
        value: this.internalValue,
        options: this.internalOptions,
        filterOption: this.filterOption,
        autofocus: this.autofocus,
        placeholder: this.placeholder,
        allowClear: this.allowClear,
        readonly: this.readonly,
        disabled: this.disabled,
        bordered: true,
        labelInValue: true,
        showSearch: this.showSearch,
        mode: this.mode,
        ...this.$attrs,
        optionFilterProp: defaultSelectProperties.filterProp,
        optionLabelProp: defaultSelectProperties.labelProp,
        'onUpdate:value': (val) => this.$emit('update:value', val),
        class: StringHelper.append([`${DEFAULT_PREFIX}-select`], CastHelper.cast(this.$attrs.class)),
        dropdownClassName: StringHelper.append(
          [`${DEFAULT_PREFIX}-select-dropdown`],
          CastHelper.cast(this.dropdownClassName)
        ).join(' '),
        getPopupContainer: this.getTriggerContainer
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        'default',
        'dropdownRender',
        'removeIcon',
        'clearIcon',
        'suffixIcon',
        'menuItemSelectedIcon'
      ])
    );
  }
});
</script>
