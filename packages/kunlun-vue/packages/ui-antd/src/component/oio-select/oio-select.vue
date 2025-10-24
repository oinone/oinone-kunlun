<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  defaultSelectProperties,
  fillSelectItemProperties,
  OioSelectProps,
  PropRecordHelper,
  SelectItem,
  SelectProperties
} from '@oinone/kunlun-vue-ui-common';
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
  emits: ['update:value', 'update:dropdown-visible'],
  setup(props, { emit }) {
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

    const onUpdateValue = (val: boolean) => {
      emit('update:value', val);
    };

    const onUpdateDropdownVisible = (val: boolean) => {
      emit('update:dropdown-visible', val);
    };

    return {
      internalProperties,
      internalOptions,
      internalValue,
      onUpdateValue,
      onUpdateDropdownVisible
    };
  },
  render() {
    const { internalOptions, internalValue, onUpdateValue, onUpdateDropdownVisible } = this;
    return createVNode(
      ASelect,
      {
        value: internalValue,
        options: internalOptions,
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
        open: this.dropdownVisible,
        optionFilterProp: defaultSelectProperties.filterProp,
        optionLabelProp: defaultSelectProperties.labelProp,
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-select`]),
        dropdownClassName: StringHelper.append(
          [`${DEFAULT_PREFIX}-select-dropdown`],
          CastHelper.cast(this.dropdownClassName)
        ).join(' '),
        getPopupContainer: this.getTriggerContainer,
        'onUpdate:value': onUpdateValue,
        onDropdownVisibleChange: onUpdateDropdownVisible
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
