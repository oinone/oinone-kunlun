<script lang="ts">
import { OioCheckboxProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Checkbox as ACheckbox } from 'ant-design-vue';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioCheckbox',
  components: {
    ACheckbox
  },
  inheritAttrs: false,
  props: {
    ...OioCheckboxProps
  },
  emits: ['update:checked', 'change'],
  slots: ['default'],
  setup(props, context) {
    const internalChecked = ref(false);
    const checked = computed<boolean>({
      get() {
        if (props.checked === undefined) {
          return internalChecked.value;
        }
        if (props.checked === null) {
          return false;
        }
        return props.checked;
      },
      set(value) {
        if (props.readonly) {
          return;
        }
        context.emit('update:checked', value);
        context.emit('change', value);
        internalChecked.value = value;
      }
    });

    const onUpdateChecked = (val: boolean) => {
      checked.value = val;
    };

    return {
      checked,
      onUpdateChecked
    };
  },
  render() {
    const { onUpdateChecked, onChange } = this;
    const checkboxClassList = [`${DEFAULT_PREFIX}-checkbox`];
    if (this.readonly) {
      checkboxClassList.push(`${DEFAULT_PREFIX}-checkbox-readonly`);
    }
    return createVNode(
      ACheckbox,
      {
        autofocus: this.autofocus,
        indeterminate: this.indeterminate,
        checked: this.checked,
        disabled: this.disabled,
        ...PropRecordHelper.collectionBasicProps(this.$attrs, checkboxClassList),
        'onUpdate:checked': onUpdateChecked
      },
      PropRecordHelper.collectionSlots(this.$slots, ['default'])
    );
  }
});
</script>
