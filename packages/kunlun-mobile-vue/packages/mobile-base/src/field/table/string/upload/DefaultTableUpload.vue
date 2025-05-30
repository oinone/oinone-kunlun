<script lang="ts">
import { createVNode, defineComponent } from 'vue';
import Upload from '../../../../components/upload/Upload.vue';

export default defineComponent({
  name: 'DefaultTableUpload',
  inheritAttrs: false,
  props: {
    currentValue: {
      type: [String, Array]
    },
    cdnKey: {
      type: String
    },
    privateLink: {
      type: Boolean,
      default: undefined
    }
  },
  render() {
    const { currentValue, cdnKey, privateLink } = this;
    return createVNode(Upload, {
      class: 'mobile-default-table-upload',
      value: currentValue,
      readonly: true,
      cdnKey,
      privateLink
    });
  }
});
</script>
