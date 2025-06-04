<script lang="ts">
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { BooleanHelper, CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { AInputPasswordProps, OioInputPasswordProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { InputPassword as AInputPassword } from 'ant-design-vue';
import { isBoolean, isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioInputPassword',
  components: {
    AInputPassword
  },
  inheritAttrs: false,
  props: {
    ...OioInputPasswordProps
  },
  slots: ['prepend', 'append', 'prefix'],
  emits: ['update:value'],
  setup(props) {
    const autocomplete = computed<string | undefined>(() => {
      if (props.autocomplete == null) {
        return 'new-password';
      }
      const val = BooleanHelper.toBoolean(props.autocomplete);
      if (isBoolean(val)) {
        return val ? 'on' : 'off';
      }
      return props.autocomplete as string | undefined;
    });

    return {
      autocomplete
    };
  },
  render() {
    return createVNode(
      AInputPassword,
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
