<script lang="ts">
import { OrganizationalStructureType, PamirsDepartment, PamirsOrganizationalStructure } from '@oinone/kunlun-engine';
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent, PropType, ref } from 'vue';
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
    domain: {
      type: String
    },
    departmentCodes: {
      type: Array as PropType<string[]>
    },
    userCompanyDept: {
      type: Boolean,
      default: undefined
    },
    userDept: {
      type: Boolean,
      default: undefined
    },
    userDeptAndChildren: {
      type: Boolean,
      default: undefined
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

    const onChange = (values: PamirsOrganizationalStructure | PamirsOrganizationalStructure[] | null | undefined) => {
      let submitValues: PamirsDepartment | PamirsDepartment[] | null | undefined;
      if (values == null) {
        submitValues = values;
      } else if (Array.isArray(values)) {
        submitValues = values
          .filter((v) => v.type === OrganizationalStructureType.department)
          .map((v) => v.value as PamirsDepartment);
      } else if (values.type === OrganizationalStructureType.department) {
        submitValues = values.value as PamirsDepartment;
      } else {
        submitValues = null;
      }
      props.change?.(submitValues);
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

      domain,
      departmentCodes,
      userCompanyDept,
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
      domain,
      departmentCodes,
      userCompanyDept,
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
