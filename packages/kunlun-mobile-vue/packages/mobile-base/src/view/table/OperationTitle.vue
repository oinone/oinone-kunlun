<template>
  <div class="table-operation">
    <van-popover
      v-if="!needOperateEntity.inline"
      v-model:show="showPopup"
      placement="bottom-end"
      class="mobile-table-operation-content"
      teleport="body"
    >
      <template #default>
        <draggable
          :class="`field-item-list ${DEFAULT_PREFIX}-scrollbar`"
          handle=".draggable-field-icon"
          v-model="showFieldsEntity"
          item-key="data"
          @change="changeDraggable"
        >
          <template #item="{ element }">
            <div class="field-item" :title="element.displayName">
              <VxeCheckbox v-model="element.checked"></VxeCheckbox>
              <span class="label">{{ element.displayName }}</span>
              <oio-icon class="draggable-field-icon" icon="oinone-yidong" color="#979797" size="14"></oio-icon>
            </div>
          </template>
        </draggable>
        <div class="save-button">
          <oio-button type="primary" size="small" :loading="saveLoading" block @click="save">{{
            translate('kunlun.common.save')
          }}</oio-button>
        </div>
      </template>
      <template #reference>
        <span class="table-operation-eye">
          <oio-icon
            icon="oinone-biaotoushezhi"
            :color="showPopup ? 'var(--oio-primary-color)' : 'var(--oio-text-color)'"
            size="14"
          ></oio-icon>
        </span>
      </template>
    </van-popover>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { Checkbox as VxeCheckbox } from 'vxe-table';
import { translate } from '@kunlun/engine';
import { DEFAULT_PREFIX, OioButton, OioIcon } from '@kunlun/vue-ui-mobile-vant';
import { Popover as VanPopover } from 'vant';
import { OperateEntity, VisibleField, UserTablePrefer } from '../../typing';

export default defineComponent({
  name: 'OperationTitle',
  components: {
    draggable,
    VanPopover,
    VxeCheckbox,
    OioIcon,
    OioButton
  },
  props: {
    needOperateEntity: {
      type: Object as PropType<OperateEntity>,
      default: () => {}
    },
    reloadUserPrefer: {
      type: Function
    },
    saveUserPrefer: {
      type: Function
    }
  },
  emits: ['changecolumns'],
  setup(props, { emit }) {
    const showPopup = ref(false);
    const preferId = ref();

    const entity = computed(() => {
      return props.needOperateEntity || {};
    });
    const showFieldsEntity = ref([] as VisibleField[]);

    const fieldEntity = computed(() => {
      return (
        entity.value?.visibleFields?.map((item) => {
          return {
            ...item,
            checked: !entity.value?.prefer?.fieldPrefer?.includes(item.data)
          };
        }) || []
      );
    });
    watch(
      () => entity.value.prefer,
      (val) => {
        if (!val) {
          showFieldsEntity.value = fieldEntity.value;
          return;
        }
        if (val.fieldOrder?.length) {
          const backFieldOrderList = val.fieldOrder || [];
          const backFieldPreferList = val.fieldPrefer || [];
          const innerOrderFields = [] as VisibleField[];
          for (const vf of backFieldOrderList) {
            const exitField = props.needOperateEntity.visibleFields?.find((_a) => _a.data === vf);
            if (exitField) {
              exitField.checked = !backFieldPreferList.includes(vf);
              innerOrderFields.push(exitField);
            }
          }
          const elseOrderFields =
            (
              props.needOperateEntity.visibleFields?.filter(
                (_a) => !backFieldOrderList.includes(_a.data)
              ) as VisibleField[]
            ).map((v) => {
              v.checked = true;
              return v;
            }) || [];
          showFieldsEntity.value = [...innerOrderFields, ...elseOrderFields];
        } else {
          showFieldsEntity.value = fieldEntity.value;
        }
      },
      { immediate: true }
    );

    const saveLoading = ref(false);
    const save = async () => {
      saveLoading.value = true;
      const fieldList = showFieldsEntity.value.filter((field) => !field.checked);
      const fieldPrefer = fieldList.map((item) => item.data);
      const fieldOrder = showFieldsEntity.value.map((item) => item.data);
      await props.saveUserPrefer?.({ fieldPrefer, fieldOrder } as UserTablePrefer);
      saveLoading.value = false;
      await props.reloadUserPrefer?.({ fieldOrder, fieldPrefer, id: entity.value.prefer?.id } as UserTablePrefer);
      showPopup.value = false;
    };

    const changeDraggable = (e) => {};

    const fieldSwitch = (field) => {
      field.checked = !field.checked;
    };

    return {
      showFieldsEntity,
      fieldEntity,
      saveLoading,
      save,
      entity,
      preferId,
      showPopup,
      fieldSwitch,
      changeDraggable,
      translate,
      DEFAULT_PREFIX
    };
  }
});
</script>
