<template>
  <div class="table-user-prefer" v-if="!invisible">
    <default-user-prefer
      :simple="simple"
      :fields="fields"
      :enter-callback="enterCallback"
      :reset-callback="resetCallback"
    />
  </div>
</template>
<script lang="ts">
import { ReturnPromise } from '@kunlun/shared';
import { defineComponent, PropType } from 'vue';
import { DefaultUserPrefer } from '../../components';

interface DataOption {
  key: string;
  title: string;
  invisible?: boolean;
  disabled?: boolean;
}

export default defineComponent({
  name: 'TableUserPrefer',
  inheritAttrs: false,
  components: {
    DefaultUserPrefer
  },
  props: {
    simple: {
      type: Boolean,
      default: undefined
    },
    invisible: {
      type: Boolean,
      default: undefined
    },
    fields: {
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
  }
});
</script>
<style lang="scss">
.table-user-prefer {
  position: absolute;
  top: 50%;
  right: var(--oio-table-user-prefer-right);
  margin-top: -16px;
  z-index: 10;
}
.table-header-column-operation .table-user-prefer {
  right: 0;
}
</style>
