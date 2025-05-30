<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  AInputPasswordProps,
  OioInputPasswordProps,
  PropRecordHelper
} from '@kunlun/vue-ui-common';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue';
import { isNil } from 'lodash-es';
import { createVNode, defineComponent, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioInputPassword',
  components: {},
  inheritAttrs: false,
  props: {
    ...OioInputPasswordProps
  },
  slots: ['prepend', 'append', 'prefix'],
  emits: ['update:value'],
  render() {
    return createVNode(
      'input',
      {
        ...PropRecordHelper.convert(AInputPasswordProps, CastHelper.cast(this)),
        readonly: this.readonly,
        iconRender: (visible: boolean) => {
          const result: VNode[] = [];
          const { value } = this;
          if (isNil(value) || !value.length) {
            return result;
          }
          if (visible) {
            result.push(createVNode(EyeOutlined));
          } else {
            result.push(createVNode(EyeInvisibleOutlined));
          }
          return result;
        },
        ...this.$attrs,
        'onUpdate:value': (val) => this.$emit('update:value', val),
        class: StringHelper.append(
          [`${DEFAULT_PREFIX}-input`, `${DEFAULT_PREFIX}-input-password`],
          CastHelper.cast(this.$attrs.class)
        )
      },
      PropRecordHelper.collectionSlots(this.$slots, [['prepend', 'addonBefore'], ['append', 'addonAfter'], 'prefix'])
    );
  }
});
</script>
