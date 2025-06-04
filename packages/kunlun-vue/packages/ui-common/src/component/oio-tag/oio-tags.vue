<script lang="ts">
import { CastHelper } from '@oinone/kunlun-shared';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { PropRecordHelper } from '../../util';
import { OioTagCheckedEvent, OioTagClosedEvent } from './event';
import { defaultTagsProperties, TagsItem, TagsProperties } from './model';
import OioTag from './oio-tag.vue';
import { OioTagsProps } from './props';
import { fillTagsItemProperties } from './util';

export default defineComponent({
  name: 'OioTags',
  inheritAttrs: false,
  props: {
    ...OioTagsProps
  },
  emits: ['checked', 'closed', 'update:value', 'update:options'],
  setup(props, context) {
    const internalProperties = computed<TagsProperties>(() => {
      return {
        ...defaultTagsProperties,
        ...(props.properties || {})
      };
    });

    const internalOptions = computed<TagsItem[]>(() => {
      if (props.mappingOptions) {
        const result: TagsItem[] = [];
        props.options?.forEach((value, index) => {
          const option = fillTagsItemProperties(value, index, internalProperties.value, props.customFillProperties);
          if (option) {
            result.push(option);
          }
        });
        return result;
      }
      return CastHelper.cast(props.options || []);
    });

    const internalValue = computed<string[]>(() => {
      const val = props.value;
      if (!val) {
        return [];
      }
      if (Array.isArray(val)) {
        return val;
      }
      return [val];
    });

    const setValue = (val: string) => {
      if (props.mode === 'multiple') {
        context.emit('update:value', [...new Set([...internalValue.value, val])]);
      } else {
        context.emit('update:value', val);
      }
    };

    const onChecked = (e: OioTagCheckedEvent) => {
      setValue(e.key);
      context.emit('checked', e);
    };

    const onClosed = (e: OioTagClosedEvent) => {
      const { key } = e;
      context.emit(
        'update:options',
        internalOptions.value.filter((v) => v.key === key).map((v) => v.data)
      );
      context.emit('closed', e);
    };

    return {
      internalProperties,
      internalOptions,
      internalValue,
      onChecked,
      onClosed
    };
  },
  render() {
    const { $attrs, allowChecked, allowClosed, internalOptions, internalValue, onChecked, onClosed } = this;
    const classNames = [`${DEFAULT_PREFIX}-tags`];
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps($attrs, classNames)
      },
      internalOptions.map((option) => {
        const { key } = option;
        let { checked, closable } = option;
        if (checked == null && allowChecked) {
          checked = internalValue.findIndex((v) => v === option.key) !== -1;
        }
        if (closable == null && allowClosed) {
          closable = true;
        }
        return createVNode(
          OioTag,
          {
            key,
            value: key,
            color: option.color,
            backgroundColor: option.backgroundColor,
            icon: option.icon,
            allowChecked,
            checked,
            closable,
            onChecked: allowChecked ? onChecked : undefined,
            onClosed: allowClosed ? onClosed : undefined
          },
          {
            default: () => option.label
          }
        );
      })
    );
  }
});
</script>
