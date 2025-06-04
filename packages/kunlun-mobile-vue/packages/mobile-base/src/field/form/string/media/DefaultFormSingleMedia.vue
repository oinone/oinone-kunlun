<script lang="ts">
import { createVNode, defineComponent } from 'vue';
import { InputMediaMode } from '@oinone/kunlun-vue-ui-common';
import { InputMediaProps } from '../../../prop';
import DefaultString from '../DefaultString.vue';
import MediaSingle from '../../../../components/common/media-single/MediaSingle.vue';
import { UploadCom, UploadCommonProps } from '../../../../components';

export default defineComponent({
  props: {
    ...InputMediaProps,
    ...UploadCommonProps,
    fakeVertical: Boolean
  },
  inheritAttrs: false,
  render() {
    const _props: Record<string, unknown> = {
      ...this.$props,
      'onUpdate:value': this.change,
      fakeVertical: this.fakeVertical,
      onFocus: this.focus,
      onBlur: this.blur
    };
    if (this.mode === InputMediaMode.DYNAMIC) {
      if (this.fileSource === 'UPLOAD') {
        return createVNode(UploadCom, _props);
      }
      return createVNode(DefaultString, _props);
    }
    return createVNode(MediaSingle, {
      value: this.value,
      defaultValue: this.defaultValue,
      emptyStyle: this.emptyStyle
    });
  }
});
</script>
