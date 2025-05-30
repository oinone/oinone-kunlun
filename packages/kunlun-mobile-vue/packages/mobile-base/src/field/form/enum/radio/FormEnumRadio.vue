<template>
  <div class="mobile-form-enum-radio">
    <div class="not-readonly" v-if="!readonly || (readonly && disabled)" :class="computeRadioGroupClass">
      <van-radio-group :direction="direction" :model-value="realValue" :disabled="disabled">
        <template v-if="radioMode === 'BUTTON'">
          <van-cell-group inset v-for="item in options" v-show="computeItemShow(item)" :class="computeRadioClass(item)">
            <van-cell :title="item.label || item.displayName" clickable @click="selectRadio(computeItemName(item))">
              <template #right-icon>
                <van-radio :name="computeItemName(item)" />
              </template>
            </van-cell>
          </van-cell-group>
        </template>
        <template v-else>
          <van-radio
            v-for="item in options"
            v-show="computeItemShow(item)"
            :class="computeRadioClass(item)"
            :key="item.name"
            :name="item.name"
            @click="selectRadio(computeItemName(item))"
            @blur="blur"
          >
            {{ item.label || item.displayName }}
            <br />
            <span v-if="computeItemHintIf(item)" class="item-hint">{{ item.hint }}</span>
          </van-radio>
        </template>
      </van-radio-group>
    </div>
    <div class="readonly" v-else-if="readonly && radioLabel">{{ radioLabel }}</div>
    <div class="readonly empty-value" v-else-if="readonly && !radioLabel">-</div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { Radio as VanRadio, RadioGroup as VanRadioGroup, Cell as VanCell, CellGroup as VanCellGroup } from 'vant';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';
import { enumFetchLabelByValue } from '../../../util';

enum OrientationEnum {
  VERTICAL = 'VERTICAL',
  TRANSVERSE = 'TRANSVERSE'
}
export default defineComponent({
  components: {
    VanRadioGroup,
    VanRadio,
    VanCell,
    VanCellGroup
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Boolean],
      default: undefined
    },
    defaultValue: {
      type: [String, Boolean],
      default: undefined
    },
    allowClear: {
      type: Boolean,
      default: false
    },
    radioMode: {
      type: String
    },
    buttonStyle: {
      type: String,
      default: 'solid'
    },
    orientation: {
      type: String
    },
    options: {
      type: Array,
      required: false
    }
  },
  setup(props) {
    const { realValue, readonly, disabled } = useMetadataProps(props);

    const radioLabel = computed(() => {
      return enumFetchLabelByValue(realValue.value, props.options as any);
    });

    const computeRadioGroupClass = computed(() => {
      return props.orientation === OrientationEnum.VERTICAL ? 'vertical' : '';
    });

    const computeItemName = (item) => {
      return item.name === 'false' || item.name === 'true' ? JSON.parse(item.name) : item.name;
    };

    const computeItemShow = (item) => {
      return item.invisible === false || item.invisible === undefined;
    };

    const computeRadioClass = (item) => {
      return props.orientation === OrientationEnum.VERTICAL && item.hint ? 'has-hint' : '';
    };

    const computeItemHintIf = (item) => {
      return props.orientation === OrientationEnum.VERTICAL && item.hint;
    };

    const selectRadio = (currentValue) => {
      realValue.value = realValue.value === currentValue ? undefined : currentValue;
      if (props.change) {
        props.change(realValue.value);
      }
    };

    const direction = computed(() => {
      return props.orientation === OrientationEnum.VERTICAL || props.radioMode === 'BUTTON' ? 'vertical' : 'horizontal';
    });

    return {
      realValue,
      readonly,
      computeRadioGroupClass,
      direction,
      computeItemName,
      computeItemShow,
      computeRadioClass,
      computeItemHintIf,
      disabled,
      radioLabel,
      selectRadio
    };
  }
});
</script>
<style lang="scss">
.mobile-form-enum-radio {
  .not-readonly {
    .van-radio-group--horizontal {
      justify-content: flex-end;
    }
  }
}
</style>
