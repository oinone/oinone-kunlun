<template>
  <div class="default-icon-select">
    <div v-if="isSelected" class="default-icon-select-icon">
      <oio-icon :icon="value" size="18px" color="var(--oio-primary-color)" />
    </div>
    <oio-button @click="showModal">{{ $translate('选择图标') }}</oio-button>
    <oio-modal
      :data="editValue"
      v-model:visible="visible"
      :loading="loading"
      :confirm-loading="loading"
      :title="$translate(modalTitle) || $translate('选择图标')"
      width="small"
      :destroy-on-close="true"
      :enterCallback="enterCallback"
    >
      <template #default="{ data }">
        <icon-select v-model:value="data.value" :data="showDataSource" />
      </template>
    </oio-modal>
  </div>
</template>
<script lang="ts">
import { OioButton, OioIcon, OioModal } from '@kunlun/vue-ui-antd';
import { isEmpty, isString } from 'lodash-es';
import { computed, defineComponent, PropType, ref } from 'vue';
import { IconDefine, IconSelect } from '../../../../icon-manage/components/icon-select';

interface EditValue {
  value?: string;
}

export default defineComponent({
  name: 'DefaultIconSelect',
  components: {
    OioIcon,
    OioButton,
    OioModal,
    IconSelect
  },
  inheritAttrs: false,
  props: {
    value: {
      type: String
    },
    icons: {
      type: [String, Array] as PropType<keyof typeof IconDefine | string[]>
    },
    modalTitle: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: undefined
    },
    confirmLoading: {
      type: Boolean,
      default: undefined
    },
    change: {
      type: Function as PropType<(value: string | undefined) => void>
    }
  },
  setup(props) {
    const visible = ref(false);

    const editValue = ref<EditValue>({});

    const isSelected = computed(() => {
      return !isEmpty(props.value);
    });

    const showDataSource = computed(() => {
      const data = props.icons;
      if (isString(data)) {
        if (Object.keys(IconDefine).includes(data)) {
          return data;
        }
        return data.split(',').filter((v) => !!v);
      }
      return data;
    });

    const showModal = () => {
      editValue.value.value = props.value;
      visible.value = true;
    };

    const enterCallback = (e: PointerEvent, data: EditValue) => {
      props.change?.(data.value);
      visible.value = false;
    };

    return {
      visible,
      editValue,
      isSelected,

      showDataSource,

      showModal,
      enterCallback
    };
  }
});
</script>
<style lang="scss">
.default-icon-select {
  display: flex;
  column-gap: 16px;

  &-icon {
    width: 40px;
    height: 40px;
    background-color: #f7f7f7;
    border-radius: var(--oio-border-radius);
    display: inline-flex;
    justify-content: center;
  }
}
</style>
