<script lang="ts">
import type { AuthRole } from '@oinone/kunlun-engine';
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent, type PropType, ref } from 'vue';
import { DefaultSelect, DefaultSelectProps } from '../base';
import RoleModal from './RoleModal.vue';

export default defineComponent({
  name: 'RoleSelect',
  components: {
    DefaultSelect,
    RoleModal
  },
  inheritAttrs: false,
  props: {
    ...DefaultSelectProps,
    roleModel: {
      type: String
    },
    domain: {
      type: String
    },
    roleCodes: {
      type: Array as PropType<string[]>
    },
    userRole: {
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

    const onChange = (values: AuthRole | AuthRole[] | null | undefined) => {
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

      roleModel,
      domain,
      roleCodes,
      userRole
    } = this;
    const classNames = ['oio-role-select'];
    const modal = createVNode(RoleModal, {
      mode,
      selected,
      allowClear,
      model: roleModel,
      domain,
      roleCodes,
      userRole,
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
              return $translate('选择角色');
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
