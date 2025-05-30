<template>
  <div class="mobile-form-single-select">
    <div class="readonly" v-if="readonly && !disabled">
      <oio-select :title="fieldLabel" :value="realValue" :options="finalOptions" :properties="properties" />
    </div>
    <oio-select
      v-else
      :title="fieldLabel"
      :value="realValue"
      :options="finalOptions"
      :properties="properties"
      :allowClear="allowClear"
      :filter-option="false"
      :not-found-content="null"
      :default-active-first-option="false"
      :disabled="disabled"
      :placeholder="readonly || disabled ? '' : placeholder"
      @change="selectChange"
      @blur="blur"
      @focus="focus"
    />
  </div>
</template>
<script lang="ts">
import { deepClone } from '@kunlun/meta';
import { defaultSelectProperties, OioSelect, SelectItem, SelectProperties } from '@kunlun/vue-ui-mobile-vant';
import { computed, defineComponent, watch } from 'vue';
import { isNil } from 'lodash-es';
import { OioCommonProps, OioMetadataProps, useMetadataProps, useInjectOioDefaultFormContext } from '../../../../../basic';
import { RuntimeEnumerationOption } from '@kunlun/engine';
import { optionsConvertSelectItem } from '../../../../util';

export default defineComponent({
  components: {
    OioSelect
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Boolean, Object],
      default: undefined
    },
    defaultValue: {
      type: [String, Boolean, Object],
      default: undefined
    },
    options: {
      type: Array
    },
    allowClear: {
      type: Boolean
    },
    placeholder: {
      type: String
    }
  },
  setup(props) {
    const properties: SelectProperties = {
      ...defaultSelectProperties,
      labelProp: 'displayName',
      valueProp: 'name',
      keyProp: 'name',
      filterProp: 'name'
    };
    const { realValue, readonly, disabled } = useMetadataProps(props);
    const finalOptions = computed(() => {
      if (!props.options) {
        return [];
      }
      const list = deepClone(props.options) as any[];
      for (const aElement of list) {
        if (aElement.name === 'false' || aElement.name === 'true') {
          // aElement.name = JSON.parse(aElement.name);
          // aElement.value = aElement.name;
        }
      }
      return list;
    });
    // FIXME
    // const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() => optionsConvertSelectItem(props.options));

    const formContext = useInjectOioDefaultFormContext();

    const selectChange = (val: SelectItem<unknown>) => {
      realValue.value = val;
      if (props.change) {
        props.change(!isNil(val) ? val.key : undefined);
      }
      props.blur && props.blur();
    };

    return {
      properties,
      realValue,
      readonly,
      disabled,
      finalOptions,
      selectChange,
      getTriggerContainer: formContext.getTriggerContainer
    };
  }
});
</script>
