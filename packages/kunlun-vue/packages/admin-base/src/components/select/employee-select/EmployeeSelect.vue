<script lang="ts">
import type { PamirsEmployee } from '@oinone/kunlun-engine';
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent, type PropType, ref } from 'vue';
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
    ...DefaultSelectProps,
    employeeModel: {
      type: String
    },
    companyModel: {
      type: String
    },
    departmentModel: {
      type: String
    },
    roleModel: {
      type: String
    },
    domain: {
      type: String
    },
    employeeCodes: {
      type: Array as PropType<string[]>
    },
    departmentCodes: {
      type: Array as PropType<string[]>
    },
    roleCodes: {
      type: Array as PropType<string[]>
    },
    userEmployee: {
      type: Boolean
    },
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
      $translate,
      $attrs,

      mode,
      selected,
      options,
      employeeModel,
      companyModel,
      departmentModel,
      roleModel,
      domain,
      employeeCodes,
      departmentCodes,
      roleCodes,
      userEmployee,
      userDept,
      userDeptAndChildren,
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
    const classNames = ['oio-employee-select'];
    const modal = createVNode(EmployeeModal, {
      mode,
      selected,
      model: employeeModel,
      companyModel,
      departmentModel,
      roleModel,
      domain,
      employeeCodes,
      departmentCodes,
      roleCodes,
      userEmployee,
      userDept,
      userDeptAndChildren,
      visible,
      'onUpdate:visible': onUpdateVisible,
      onChange
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
              return $translate('选择员工');
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
          initSelectedOptions: options,
          options: null,
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
              icon: 'oinone-user-outlined',
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
