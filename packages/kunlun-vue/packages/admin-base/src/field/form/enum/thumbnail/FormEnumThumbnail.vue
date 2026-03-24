<template>
  <div class="form-enum-thumbnail" :class="readonly && 'readonly'">
    <div v-for="item in realOptions" class="thumbnail-item" :key="item.key" @click.stop.prevent="selectThumbnail(item)">
      <div class="item" :class="[item.value === value && 'selected']">
        <img :alt="$translate('暂时无法加载')" :src="computeThumbnailSrc(item.data.thumbnail)" />
      </div>
      <span class="label">{{ item.label }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { genStaticPath, RuntimeEnumerationOption } from '@oinone/kunlun-engine';
import { UrlHelper } from '@oinone/kunlun-shared';
import type { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent, type PropType } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';
import { optionsConvertSelectItem } from '../../../util';

export default defineComponent({
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    options: {
      type: Array as PropType<RuntimeEnumerationOption[]>,
      required: false
    },
    value: {
      type: [String, Boolean],
      default: undefined
    },
    readonly: {
      type: [String, Boolean],
      default: undefined
    },
    defaultValue: {
      type: [String, Boolean],
      required: false,
      default: undefined
    },
    allowClear: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { realValue } = useMetadataProps(props);

    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() => optionsConvertSelectItem(props.options));

    const selectThumbnail = (item: SelectItem<RuntimeEnumerationOption>) => {
      props.change && props.change(item.value);
    };

    const computeThumbnailSrc = (source: string | undefined) => {
      if (!source) {
        return undefined;
      }
      if (source.startsWith('/')) {
        return genStaticPath(UrlHelper.relativePath(source));
      }
      return source;
    };

    return {
      realValue,
      realOptions,
      selectThumbnail,
      computeThumbnailSrc
    };
  }
});
</script>
