<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  AInputSearchProps,
  OioInputSearchProps,
  PropRecordHelper
} from '@kunlun/vue-ui-common';
import { Search as VanSearch } from 'vant';
import { isEmpty } from 'lodash-es';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioInputSearch',
  components: {
    VanSearch
  },
  inheritAttrs: false,
  props: {
    ...OioInputSearchProps
  },
  slots: ['prepend', 'append', 'prefix', 'suffix'],
  emits: ['update:value'],
  render() {
    const inputClassList = [`${DEFAULT_PREFIX}-input`, `${DEFAULT_PREFIX}-input-search`];
    if (this.readonly) {
      inputClassList.push(`${DEFAULT_PREFIX}-input-readonly`);
    }
    const allowClear = this.allowClear && !isEmpty(this.value);
    if (allowClear) {
      inputClassList.push(`${DEFAULT_PREFIX}-input-allow-clear`);
    }
    return createVNode(
      VanSearch,
      {
        ...PropRecordHelper.convert(AInputSearchProps, CastHelper.cast(this)),
        readonly: this.readonly,
        minlength: this.minlength,
        ...this.$attrs,
        'onUpdate:value': (val) => this.$emit('update:value', val),
        class: StringHelper.append(inputClassList, CastHelper.cast(this.$attrs.class))
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        ['prepend', 'addonBefore'],
        ['append', 'addonAfter'],
        'prefix',
        'suffix'
      ])
    );
  }
});
</script>
