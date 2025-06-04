<script lang="ts">
import { BooleanHelper, CastHelper } from '@oinone/kunlun-shared';
import { AInputSearchProps, InputSearchEvent, OioInputSearchProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { InputSearch as AInputSearch } from 'ant-design-vue';
import { isBoolean, isEmpty } from 'lodash-es';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioButton } from '../oio-button';

export default defineComponent({
  name: 'OioInputSearch',
  components: {
    AInputSearch
  },
  inheritAttrs: false,
  props: {
    ...OioInputSearchProps
  },
  slots: ['prepend', 'append', 'prefix', 'suffix', 'enter'],
  emits: ['update:value', 'search'],
  setup(props, context) {
    const internalValue = ref();
    const value = computed(() => {
      if (props.value === undefined) {
        return internalValue.value;
      }
      return props.value;
    });

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

    const onUpdateValue = (val: string) => {
      internalValue.value = val;
      context.emit('update:value', val);
    };

    const onSearch = (val: string, e: PointerEvent | KeyboardEvent) => {
      const event: InputSearchEvent = {
        origin: [val, e],
        event: e,
        value: val
      };
      context.emit('search', event);
    };

    return {
      value,
      autocomplete,

      onUpdateValue,
      onSearch
    };
  },
  render() {
    const mainClassName = `${DEFAULT_PREFIX}-input-search`;
    const inputClassList = [mainClassName, `${mainClassName}-normal`];
    if (this.readonly) {
      inputClassList.push(`${DEFAULT_PREFIX}-input-readonly`);
    }
    const allowClear = this.allowClear && !isEmpty(this.value);
    if (allowClear) {
      inputClassList.push(`${DEFAULT_PREFIX}-input-allow-clear`);
    }
    return createVNode(
      AInputSearch,
      {
        ...PropRecordHelper.convert(AInputSearchProps, CastHelper.cast(this)),
        ...PropRecordHelper.collectionBasicProps(this.$attrs, inputClassList),
        readonly: this.readonly,
        minlength: this.minlength,
        'onUpdate:value': this.onUpdateValue,
        onSearch: this.onSearch
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        ['prepend', 'addonBefore'],
        ['append', 'addonAfter'],
        'prefix',
        'suffix',
        {
          origin: 'enter',
          target: 'enterButton',
          default: () => {
            return [
              createVNode(
                {
                  ...OioButton,
                  __ANT_BUTTON: true
                },
                { icon: 'oinone-sousuo1' }
              )
            ];
          }
        }
      ])
    );
  }
});
</script>
