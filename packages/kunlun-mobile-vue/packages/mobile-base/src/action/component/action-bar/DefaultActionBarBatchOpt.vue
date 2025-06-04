<template>
  <div :class="`${DEFAULT_PREFIX}-action-bar-batch-opt`" @click="toggle">
    <i class="icon iconfont oinone-m-batch-opt" />
    <span class="text">
      <template v-if="showCheck">{{ translateValueByKey('完成') }}</template>
      <template v-else>{{ translateValueByKey('批量管理') }}</template>
    </span>
    <!--    <span class="count" v-if="showCheck">(已选{{checkedCount}})</span>-->
  </div>
  <div :class="`${DEFAULT_PREFIX}-action-bar-batch-opt-toolbar`" v-if="showCheck">
    <div class="checkall-btn">
      <van-checkbox v-model="checkAll" shape="square" @click="checkAllChange(checkAll)">
        {{ translateValueByKey('全选') }}</van-checkbox
      >
    </div>
    <span class="count" v-if="showCheck">({{ translateValueByKey('已选') }}{{ checkboxAllState.count || 0 }})</span>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { Checkbox as VanCheckbox } from 'vant';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { DEFAULT_PREFIX } from '../../../ui/theme';

export default defineComponent({
  props: {
    checkboxAllState: {
      type: Object,
      default: () => ({})
    }
  },
  components: { VanCheckbox },
  inheritAttrs: false,
  emits: ['change', 'checkAll'],
  setup(props, { emit }) {
    const showCheck = ref(false);
    const checkAll = ref(false);

    function toggle() {
      showCheck.value = !showCheck.value;
      emit('change', showCheck.value);

      if (!showCheck.value) {
        checkAllChange(false);
      }
    }

    function checkAllChange(val) {
      emit('checkAll', val);
    }

    watch(
      () => props.checkboxAllState,
      () => {
        checkAll.value = props.checkboxAllState.checked;
      }
    );
    return { showCheck, toggle, checkAll, checkAllChange, DEFAULT_PREFIX, translateValueByKey };
  }
});
</script>
