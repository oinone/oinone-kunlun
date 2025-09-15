<script lang="ts">
import { PamirsEmployee } from '@oinone/kunlun-engine';
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DefaultSelect, DefaultSelectProps } from '../base';
import EmployeeModal from './EmployeeModal.vue';

export default defineComponent({
  name: 'EmployeeSelect',
  components: {
    DefaultSelect,
    EmployeeModal
  },
  inheritAttrs: false,
  props: {
    ...DefaultSelectProps
  },
  setup(props) {
    const visible = ref(false);

    const options = computed(() => {
      if (!props.selected) {
        return [];
      }
      if (Array.isArray(props.selected)) {
        return props.selected;
      }
      return [props.selected];
    });

    const onUpdateVisible = (val: boolean) => {
      visible.value = val;
    };

    const onShowModal = () => {
      visible.value = true;
    };

    const onChange = (values: PamirsEmployee | PamirsEmployee[] | null | undefined) => {
      props.change?.(values);
      props.blur?.();
    };

    return {
      visible,
      options,
      onUpdateVisible,
      onShowModal,
      onChange
    };
  },
  render() {
    const {
      $attrs,
      mode,
      selected,
      options,
      placeholder,
      allowClear,
      visible,
      change,
      focus,
      blur,
      onUpdateVisible,
      onShowModal,
      onChange
    } = this;
    const classNames = ['oio-department-select'];
    return createVNode(
      DefaultSelect,
      {
        ...PropRecordHelper.collectionBasicProps($attrs, classNames),
        mode,
        selected,
        options,
        placeholder,
        allowClear,
        allowArrow: false,
        allowSearch: false,
        notFoundContent: null,
        change,
        focus,
        blur
      },
      {
        suffix: () => {
          return [
            createVNode(OioButton, {
              icon: 'oinone-apartment-outlined',
              onClick: onShowModal
            }),
            createVNode(EmployeeModal, {
              mode,
              selected,
              visible,
              'onUpdate:visible': onUpdateVisible,
              onChange
            })
          ];
        }
      }
    );
  }
});
</script>
