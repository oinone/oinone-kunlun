<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  defaultSelectProperties,
  fillSelectItemProperties,
  OioSelectProps,
  PropRecordHelper,
  SelectItem,
  SelectProperties
} from '@kunlun/vue-ui-common';
import { Popup as VanPopup, Picker as VanPicker } from 'vant';
import { isNil, isObject } from 'lodash-es';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioPicker',
  components: {
    VanPopup,
    VanPicker
  },
  inheritAttrs: false,
  props: {
    ...OioSelectProps,
    title: String
  },
  slots: ['reference', 'dropdownRender', 'removeIcon', 'clearIcon', 'suffixIcon', 'menuItemSelectedIcon'],
  emits: ['update:value', 'change'],
  setup(props) {
    const realProperties = computed<SelectProperties>(() => {
      return {
        ...defaultSelectProperties,
        ...(props.properties || {})
      };
    });

    const realOptions = computed<SelectItem<unknown>[]>(() => {
      const options: SelectItem<unknown>[] = [];
      props.options?.forEach((value, index) => {
        const option = fillSelectItemProperties(value, index, realProperties.value, props.customFillProperties);
        if (option) {
          options.push(option);
        }
      });
      return options;
    });

    const realValue = computed<SelectItem<unknown> | undefined>(() => {
      const { value } = props;
      if (isNil(value) || isObject(value)) {
        return CastHelper.cast(value);
      }
      return realOptions.value.find((v) => v.key === value);
    });

    const show = ref(false);

    return {
      realProperties,
      realOptions,
      realValue,
      show
    };
  },
  render() {
    const pickerVNode = createVNode(
      VanPicker,
      {
        title: this.title,
        columns: this.realOptions,
        columnsFieldNames: { text: defaultSelectProperties.labelProp },
        onConfirm: (pickedItem) => {
          this.$emit('update:value', pickedItem);
          this.$emit('change', pickedItem);
          this.show = false;
        }
        // onCancel: () => (this.show = false)
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        'default',
        'dropdownRender',
        'removeIcon',
        'clearIcon',
        'suffixIcon',
        'menuItemSelectedIcon',
        'title',
        'confirm',
        'cancel',
        'option',
        'columns-top',
        'columns-bottom'
      ])
    );
    const popupVNode = createVNode(
      VanPopup,
      {
        round: true,
        position: 'bottom',
        teleport: 'body',
        show: this.show,
        safeAreaIInsetBottom: true,
        'onUpdate:show': (val) => (this.show = val)
      },
      [pickerVNode]
    );
    const referenceNode =
      this.$slots.reference?.() ||
      createVNode('input', {
        class: `${DEFAULT_PREFIX}-input van-field__control`,
        readonly: true,
        value: this.realValue && this.realValue.label,
        placeholder: this.placeholder
      });
    return createVNode(
      'div',
      {
        class: StringHelper.append([`${DEFAULT_PREFIX}-picker`], CastHelper.cast(this.$attrs.class)),
        onClick: () => {
          if (this.disabled || this.readonly) {
            return;
          }
          this.show = !this.show;
        }
      },
      [ referenceNode, popupVNode ]
    );
  }
});
</script>
