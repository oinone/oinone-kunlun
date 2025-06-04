<template>
  <div
    class="mobile-form-multi-enum-checkbox-group"
    :class="`mobile-form-multi-enum-checkbox-group-${radioMode && radioMode.toLowerCase()} ${layout}`"
  >
    <div class="not-readonly" v-if="!readonly || (readonly && disabled)">
      <template v-if="radioMode === 'BUTTON'">
        <van-checkbox-group ref="checkboxGroup" :modelValue="realValue" :disabled="disabled" @change="tickChange">
          <van-cell-group inset>
            <van-cell
              v-for="(item, index) in realOptions"
              clickable
              :key="item.name"
              :title="item.label || item.displayName"
              @click="toggle(index)"
            >
              <template #right-icon>
                <van-checkbox :name="item.name" :ref="(el) => (checkboxRefs[index] = el)" @click.stop="toggle(index)" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-checkbox-group>
      </template>
      <template v-else>
        <!--        <van-checkbox-->
        <!--          v-if="showCheckAll" style="margin-bottom: 6px;"-->
        <!--          v-model="checkAll"-->
        <!--          :shape="shape"-->
        <!--          :class="orientation === 'VERTICAL' ? 'van-checkbox&#45;&#45;vertical' : 'van-checkbox&#45;&#45;horizontal'"-->
        <!--          @change="checkAllChange">全选</van-checkbox>-->

        <van-checkbox-group
          ref="checkboxGroup"
          :class="orientation === 'VERTICAL' ? 'vertical' : ''"
          :direction="orientation === 'VERTICAL' ? 'vertical' : 'horizontal'"
          :modelValue="realValue"
          :disabled="disabled"
          @change="tickChange"
        >
          <van-checkbox
            v-for="(item, index) in realOptions"
            :class="orientation === 'VERTICAL' && item.hint ? 'has-hint' : ''"
            :key="item.name"
            :name="item.name"
            :shape="shape"
            @click.stop="toggle(index)"
            @blur="blur"
          >
            {{ item.label || item.displayName }}
            <br />
            <span v-if="orientation === 'VERTICAL' && item.hint" class="item-hint">{{ item.hint }}</span>
          </van-checkbox>
        </van-checkbox-group>
      </template>
    </div>
    <div class="readonly" v-else-if="readonly && multiSelectLabel">{{ multiSelectLabel }}</div>
    <div class="readonly empty-value" v-else-if="readonly && !multiSelectLabel">-</div>
  </div>
</template>
<script lang="ts">
import { deepClone, IModelFieldOption } from '@oinone/kunlun-meta';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { isEmpty, isNil } from 'lodash-es';
import { computed, defineComponent, PropType, watch, ref, nextTick } from 'vue';
import {
  CheckboxGroup as VanCheckboxGroup,
  Checkbox as VanCheckbox,
  Cell as VanCell,
  CellGroup as VanCellGroup
} from 'vant';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';
import { multiEnumFetchLabelByValue } from '../../../util';
import { CHECK_ALL_VALUE } from '../../../../typing';

export default defineComponent({
  components: { VanCheckboxGroup, VanCheckbox, VanCell, VanCellGroup },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Array]
    },
    defaultValue: {
      type: [String, Array]
    },
    allowClear: {
      type: Boolean
    },
    showCheckAll: {
      type: Boolean,
      default: false
    },
    shape: {
      type: String as PropType<'round' | 'square'>,
      default: 'square'
    },
    orientation: {
      type: String
    },
    options: {
      type: Array as PropType<IModelFieldOption[]>,
      default: () => []
    },
    radioMode: {
      type: String
    }
  },
  setup(props) {
    const { realValue, readonly, disabled } = useMetadataProps(props, true);
    const checkAll = ref(false);

    const multiSelectLabel = computed(() => {
      if (isNil(realValue.value)) {
        return '';
      }
      return multiEnumFetchLabelByValue(realValue.value, props.options as any);
    });

    watch(
      () => props.value,
      (newVal) => {
        if (checkAll.value && newVal) {
          newVal = [CHECK_ALL_VALUE, ...newVal];
        }
        realValue.value = newVal || [];
      }
    );

    watch(
      () => props.defaultValue,
      (v) => {
        if (isEmpty(props.value)) {
          realValue.value = v || [];
        }
      }
    );

    function tickChange(checkedValues: string[]) {
      if (!checkAll.value && checkedValues.includes(CHECK_ALL_VALUE)) {
        checkAllChange(true);
        return;
      }
      if (checkAll.value && !checkedValues.includes(CHECK_ALL_VALUE)) {
        checkAllChange(false);
        return;
      }
      changeHandle(checkedValues);
    }

    function changeHandle(checkedValues: string[]) {
      const newSortList = deepClone(checkedValues);
      const oldSortList = deepClone(realValue.value || []);
      const sortFunc = (a, b) => {
        return realOptions.value?.findIndex((i) => i.name === a) - realOptions.value?.findIndex((i) => i.name === b);
      };
      newSortList.sort(sortFunc);
      oldSortList.sort(sortFunc);
      if (JSON.stringify(newSortList) != JSON.stringify(oldSortList)) {
        props?.change?.(newSortList.filter((a) => a != CHECK_ALL_VALUE));
        realValue.value = newSortList;
      }
    }

    const realOptions = computed<IModelFieldOption[]>(() => {
      if (props.options) {
        const list = props.options.filter((v) => !v.invisible);
        if (props.showCheckAll && list.length) {
          return [
            { label: translateValueByKey('全选'), name: CHECK_ALL_VALUE, value: CHECK_ALL_VALUE },
            ...list
          ] as IModelFieldOption[];
        }
        return list;
      }
      return [];
    });
    const checkboxGroup = ref(null as any);
    const checkboxRefs = ref([]);
    function checkAllChange(isChecked: boolean) {
      const list: string[] = isChecked ? realOptions.value?.map((a) => a?.value! as string)! : ([] as string[]);
      changeHandle(list);
      checkAll.value = isChecked;
    }

    function toggle(index: number) {
      const item = realOptions.value[index];

      const realList = realValue.value || ([] as string[]);
      const findIndex = realList.findIndex((a) => a === item.name);
      if (findIndex === undefined || findIndex === -1) {
        tickChange([...realList, item.name]);
      } else {
        let cloneList = deepClone(realList);
        cloneList.splice(findIndex, 1);
        if (
          cloneList.filter((a) => a !== CHECK_ALL_VALUE).length !==
          realOptions.value.filter((a) => a.name !== CHECK_ALL_VALUE).length
        ) {
          if (cloneList.includes(CHECK_ALL_VALUE)) {
            cloneList = cloneList.filter((a) => a !== CHECK_ALL_VALUE);
            checkAll.value = false;
          }
        }
        tickChange(cloneList);
      }
      nextTick(() => {
        realOptions.value.forEach((opt, idx) => {
          (checkboxRefs.value[idx] as any)?.toggle?.(realValue.value?.includes(opt.name));
        });
      });
    }

    return {
      checkAll,
      checkAllChange,
      checkboxGroup,
      checkboxRefs,
      realValue,
      readonly,
      disabled,
      multiSelectLabel,
      realOptions,
      toggle,
      tickChange
    };
  }
});
</script>
