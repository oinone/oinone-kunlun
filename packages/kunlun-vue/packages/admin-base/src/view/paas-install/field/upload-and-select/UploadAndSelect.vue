<template>
  <div class="PaaSInstallSelectWrapper">
    <div
      class="PaaSModuleIcon"
      :style="{
        'background-image': `url(${uploadImgUrl})`
      }"
    ></div>
    <div class="form-single-select">
      <div class="readonly" v-if="readonly && !disabled">
        <a-select
          class="oio-select"
          dropdown-class-name="oio-select-dropdown"
          label-in-value
          :value="currentValue"
          :options="options"
        />
      </div>

      <div v-else>
        <a-select
          class="oio-select"
          dropdown-class-name="oio-select-dropdown"
          show-search
          :allowClear="showClear"
          :disabled="disabled"
          :value="currentValue"
          :filter-option="false"
          :not-found-content="null"
          :default-active-first-option="false"
          label-in-value
          :options="options"
          :placeholder="placeholder"
          @change="change"
          @search="search"
          @blur="blur"
        >
          <template #dropdownRender="{ menuNode: menu }">
            <v-nodes :vnodes="menu" />
            <div @mousedown="(e) => e.preventDefault()">
              <oio-button type="primary" @click="loadMore" :disabled="loadMoreLoading" v-if="showMoreButton"
                >{{ translateValueByKey('加载更多') }}
              </oio-button>
            </div>
          </template>
        </a-select>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { BooleanHelper, OioButton } from '@oinone/kunlun-vue-ui-antd';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { computed, defineComponent } from 'vue';
import { enumFetchLabelByValue } from '../../../../field';
import { usePlaceholderProps } from '../../../../basic';

export default defineComponent({
  inheritAttrs: false,
  props: [
    'value',
    'options',
    'change',
    'search',
    'focus',
    'blur',
    'loadMore',
    'loadMoreLoading',
    'readonly',
    'disabled',
    'viewType',
    'fromTable',
    'field',
    'invisible',
    'validation',
    'required',
    'placeholder',
    'showMoreButton',
    'showClear',
    'uploadImgUrl'
  ],
  components: {
    OioButton,
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    }
  },
  setup(props) {
    const readonly = computed(() => BooleanHelper.toBoolean(props.readonly));

    const disabled = computed(() => BooleanHelper.toBoolean(props.disabled));

    const currentValue = computed(() => {
      if (props.value && props.value.id) {
        return { value: props.value.id };
      }

      return null;
    });
    const currentValueLabel = computed(() => {
      if (props.value && props.value.id) {
        return enumFetchLabelByValue(props.value.id, props.options);
      }

      return null;
    });
    const { placeholder } = usePlaceholderProps(props);
    return {
      placeholder,
      readonly,
      disabled,
      currentValue,
      currentValueLabel,
      translateValueByKey
    };
  }
});
</script>
<style lang="scss">
.PaaSInstallSelectWrapper {
  width: 160px;
  height: 128px;
  position: relative;
  border: solid 1px #d9d9d9;
  border-bottom: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .PaaSModuleIcon {
    width: 80px;
    height: 80px;
    margin: 4px 0;
    background-size: contain;
    object-fit: contain;
    display: flex;
    justify-content: center;
  }

  .form-single-select {
    position: absolute;
    bottom: 0;
    width: 100%;

    .ant-select-selector {
      height: 40px;
      border-radius: inherit !important;
      border-left: none;
      border-right: none;
    }

    .ant-select-selection-item {
      line-height: 40px;
    }
  }
}
</style>
