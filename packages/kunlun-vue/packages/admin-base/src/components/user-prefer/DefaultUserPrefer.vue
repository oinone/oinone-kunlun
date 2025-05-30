<script lang="ts">
import { ButtonType, OioButton, OioModal, PropRecordHelper, ReturnPromise } from '@kunlun/vue-ui-antd';
import { Transfer as ATransfer } from 'ant-design-vue';
import { createVNode, defineComponent, nextTick, PropType, ref, VNode } from 'vue';
import SimpleUserPreferSetting from './SimpleUserPreferSetting.vue';
import StandardUserPreferSetting from './StandardUserPreferSetting.vue';
import { classNamePrefix, DataOption } from './typing';

export default defineComponent({
  name: 'DefaultUserPrefer',
  components: {
    OioButton,
    OioModal,
    ATransfer
  },
  props: {
    simple: {
      type: Boolean,
      default: undefined
    },
    fields: {
      type: Array as PropType<DataOption[]>
    },
    invisibleFields: {
      type: Array as PropType<DataOption[]>
    },
    visibleFields: {
      type: Array as PropType<DataOption[]>
    },
    enterCallback: {
      type: Function as PropType<
        (allFields: DataOption[], invisibleFields: DataOption[], visibleFields: DataOption[]) => ReturnPromise<boolean>
      >
    },
    resetCallback: {
      type: Function
    }
  },
  setup(props) {
    const selected = ref(false);
    const visible = ref(false);

    const onUpdateSelected = (val: boolean) => {
      selected.value = val;
      visible.value = val;
    };

    const onClick = () => {
      onUpdateSelected(true);
    };

    const onOk = async (allFields: DataOption[], invisibleFields: DataOption[], visibleFields: DataOption[]) => {
      const res = await props.enterCallback?.(allFields, invisibleFields, visibleFields);
      if (res == null || res) {
        return nextTick(() => {
          onUpdateSelected(false);
        });
      }
    };

    const onReset = async () => {
      const res = await props.resetCallback?.();
      if (res == null || res) {
        return nextTick(() => {
          onUpdateSelected(false);
        });
      }
    };

    const onSave = (allFields: DataOption[], invisibleFields: DataOption[], visibleFields: DataOption[]) => {
      props.enterCallback?.(allFields, invisibleFields, visibleFields);
    };

    return {
      selected,
      visible,
      onUpdateSelected,

      onClick,
      onOk,
      onReset,
      onSave
    };
  },
  render() {
    const {
      $slots,
      simple,
      fields,
      invisibleFields,
      visibleFields,
      selected,
      visible,
      onUpdateSelected,

      onClick,
      onOk,
      onReset,
      onSave
    } = this;
    const { trigger: triggerSlot } = PropRecordHelper.collectionSlots($slots, ['trigger']);
    let children: VNode[];
    if (triggerSlot) {
      children = triggerSlot({ onClick });
    } else {
      children = [
        createVNode(OioButton, {
          type: ButtonType.link,
          icon: 'oinone-biaotoushezhi',
          selected,
          'onUpdate:selected': onUpdateSelected,
          onClick
        })
      ];
    }
    if (simple) {
      const triggerChildren = children;
      children = [
        createVNode(
          SimpleUserPreferSetting,
          {
            visible,
            fields,
            invisibleFields,
            visibleFields,
            'onUpdate:visible': onUpdateSelected,
            onSave
          },
          {
            trigger: () => triggerChildren
          }
        )
      ];
    } else {
      children.push(
        createVNode(StandardUserPreferSetting, {
          visible,
          fields,
          invisibleFields,
          visibleFields,
          'onUpdate:visible': onUpdateSelected,
          ok: onOk,
          reset: onReset
        })
      );
    }
    return createVNode('span', { class: classNamePrefix }, children);
  }
});
</script>
