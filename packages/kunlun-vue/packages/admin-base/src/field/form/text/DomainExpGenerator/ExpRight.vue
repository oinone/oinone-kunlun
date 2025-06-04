<template>
  <template
    v-if="field && (field.ttype === 'M2O' || field.ttype === 'M2M' || field.ttype === 'O2M' || field.ttype === 'O2O')"
  >
    <a-select
      class="oio-select"
      dropdown-class-name="oio-select-dropdown"
      :mode="field.ttype === 'O2M' || field.ttype === 'M2M' ? 'multiple' : 'default'"
      :value="exp.right.val"
      @change="changeValue"
      style="width: 20%"
    >
      <a-select-option v-for="(opt, index) in options" :value="opt.value" :key="index">{{ opt.name }}</a-select-option>
    </a-select>
  </template>
  <template v-if="field && field.ttype === 'STRING'">
    <oio-input :value="exp.right.val" @update:value="changeValue({ val: $event })" style="width: 20%" />
  </template>
  <template v-if="field && ['INTEGER', 'FLOAT', 'MONEY'].includes(field.ttype)">
    <oio-input
      v-if="!showContextItem"
      :value="exp.right.val"
      @update:value="changeValue({ val: $event })"
      style="width: 20%"
    />
    <a-select
      v-if="showContextItem"
      class="oio-select"
      dropdown-class-name="oio-select-dropdown"
      :value="exp.right.val"
      @change="changeContextItemValue"
      style="width: 20%"
    >
      <a-select-option v-for="(opt, index) in contextItemOptions" :value="opt.val" :key="index">{{
        opt.label
      }}</a-select-option>
    </a-select>
    <oio-button style="margin-left: var(--oio-margin)" type="link" @click="changeShowContextItem">{{
      showContextItem ? translateValueByKey('直接输入') : translateValueByKey('选择变量')
    }}</oio-button>
  </template>
  <template v-if="field && field.ttype === 'TEXT'">
    <oio-textarea :value="exp.right.val" @update:value="changeValue({ val: $event })" style="width: 20%" />
  </template>
  <template v-if="field && field.ttype === 'ENUM'">
    <a-select
      class="oio-select"
      dropdown-class-name="oio-select-dropdown"
      :value="exp.right.val"
      @change="changeValue({ val: $event })"
      style="width: 20%"
    >
      <a-select-option v-for="opt in field.options" :key="opt.value" :value="opt.value"
        >{{ opt.displayName }}
      </a-select-option>
    </a-select>
  </template>
  <template v-if="field && field.ttype === 'BOOLEAN'">
    <a-select
      class="oio-select"
      dropdown-class-name="oio-select-dropdown"
      :value="exp.right.val"
      @change="changeValue({ val: $event })"
      style="width: 20%"
    >
      <a-select-option :key="true" :value="true">{{ translateValueByKey('是') }}</a-select-option>
      <a-select-option :key="true" :value="false">{{ translateValueByKey('否') }}</a-select-option>
    </a-select>
  </template>
  <template v-if="field && field.ttype === 'DATETIME'">
    <oio-date-time-picker style="width: 20%" @change="changeValue({ val: $event })" :value="exp.right.val" />
  </template>
  <template v-if="field && field.ttype === 'DATE'">
    <oio-date-picker style="width: 20%" @change="changeValue({ val: $event })" :value="exp.right.val" />
  </template>
  <template v-if="field && field.ttype === 'TIME'">
    <oio-time-picker style="width: 20%" @change="changeValue({ val: $event })" :value="exp.right.val" />
  </template>
  <template v-if="field && field.ttype === 'YEAR'">
    <oio-year-picker style="width: 20%" @change="changeValue({ val: $event })" :value="exp.right.val" />
  </template>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import {
  OioInput,
  OioButton,
  OioInputNumber,
  OioTextarea,
  OioDateTimePicker,
  OioDatePicker,
  OioTimePicker,
  OioYearPicker
} from '@oinone/kunlun-vue-ui-antd';
import { IModelField, ModelFieldType } from '@oinone/kunlun-meta';
import { queryPage, getModel } from '@oinone/kunlun-service';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { Select as ASelect } from 'ant-design-vue';

export default defineComponent({
  name: 'ExpRight',
  components: {
    OioInput,
    OioButton,
    OioInputNumber,
    OioTextarea,
    OioDateTimePicker,
    OioDatePicker,
    OioTimePicker,
    OioYearPicker,
    ASelect,
    ASelectOption: ASelect.Option
  },
  props: ['exp', 'field'],
  emits: ['change-value'],
  setup(props, ctx) {
    const options = ref<{ name: string; value: unknown }[]>([]);
    watch(
      () => props.field,
      async () => {
        const field = props.field! as IModelField;
        if (field && field.references) {
          const refModel = await getModel(field!.references!);
          const displayName = refModel.labelFields![0];
          const name = field.referenceFields![0];
          switch (field.ttype) {
            case ModelFieldType.OneToOne:
            case ModelFieldType.OneToMany:
            case ModelFieldType.ManyToMany:
            case ModelFieldType.ManyToOne: {
              const data = (await queryPage(field.references!, { pageSize: 500 })).content;
              options.value = data.map((d) => {
                return {
                  name: d[displayName] as string,
                  value: d[name]
                };
              });
              break;
            }
            default:
          }
        }
      },
      { deep: true }
    );
    const contextItemOptions = [
      {
        key: 'currentUser',
        name: '当前登录用户id',
        val: '${currentUser}',
        label: '当前登录用户id'
      }
    ];
    const showContextItem = ref(false);
    const exitContextItem = contextItemOptions.find((_o) => _o.val === props.exp.right.val);
    if (exitContextItem) {
      showContextItem.value = true;
    }
    const changeShowContextItem = () => {
      showContextItem.value = !showContextItem.value;
    };
    const changeContextItemValue = (opt) => {
      const optValue = contextItemOptions.find((_o) => _o.val === opt);
      ctx.emit('change-value', optValue);
    };
    return {
      options,
      showContextItem,
      contextItemOptions,
      translateValueByKey,
      changeShowContextItem,
      changeContextItemValue,
      changeValue(val) {
        const value = Array.isArray(val)
          ? val.map((v) => options.value.find((opt) => opt.value === v))
          : options.value.find((opt) => opt.value === val);
        ctx.emit('change-value', value || val);
      }
    };
  }
});
</script>
