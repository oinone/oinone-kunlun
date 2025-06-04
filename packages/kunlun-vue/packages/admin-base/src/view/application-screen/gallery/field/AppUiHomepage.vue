<template>
  <div class="not-found-homepage">
    <oio-button type="link" @click="onPageDesigner">{{
      $translate('没找到想要的页面？点我去创建，自动完成绑定')
    }}</oio-button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { onJumpUiDesignerHomePage } from '../../../../util';

export default defineComponent({
  components: {
    OioButton
  },
  inheritAttrs: false,
  props: ['currentRecord'],
  setup(props) {
    const onPageDesigner = () => {
      onJumpUiDesignerHomePage(props.currentRecord, true);
    };
    return {
      onPageDesigner
    };
  }
});
</script>

<style lang="scss">
.not-found-homepage {
  margin-top: -24px;
}
</style>
