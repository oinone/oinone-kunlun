<script lang="ts">
import { PamirsDepartment } from '@oinone/kunlun-engine';
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DefaultSelect, DefaultSelectProps } from '../base';
import DepartmentModal from './DepartmentModal.vue';

export default defineComponent({
  name: 'DepartmentSelect',
  components: {
    DefaultSelect
  },
  inheritAttrs: false,
  props: {
    ...DefaultSelectProps,
    userDept: {
      type: Boolean
    },
    userDeptAndChildren: {
      type: Boolean
    }
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

    const onChange = (values: PamirsDepartment | PamirsDepartment[] | null | undefined) => {
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
      $translate,
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
      onChange,

      userDept,
      userDeptAndChildren
    } = this;
    const classNames = ['oio-department-select'];
    const modal = createVNode(DepartmentModal, {
      mode,
      selected,
      visible,
      'onUpdate:visible': onUpdateVisible,
      onChange,
      userDept,
      userDeptAndChildren
    });
    if (selected == null || (Array.isArray(selected) && !selected.length)) {
      return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, classNames), [
        createVNode(
          OioButton,
          {
            type: 'default',
            block: true,
            icon: 'oinone-plus-outlined',
            onClick: onShowModal
          },
          {
            default: () => {
              return $translate('选择部门');
            }
          }
        ),
        modal
      ]);
    }
    return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, classNames), [
      createVNode(
        DefaultSelect,
        {
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
            return createVNode(OioButton, {
              icon: 'oinone-apartment-outlined',
              onClick: onShowModal
            });
          }
        }
      ),
      modal
    ]);
  }
});
</script>
