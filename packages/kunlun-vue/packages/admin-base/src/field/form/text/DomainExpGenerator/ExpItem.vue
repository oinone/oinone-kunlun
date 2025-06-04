<template>
  <oio-form-item label=" ">
    <a-select
      class="oio-select"
      dropdown-class-name="oio-select-dropdown"
      :value="exp.left.val"
      style="width: 20%; margin-right: var(--oio-margin)"
      @change="fieldChange"
    >
      <a-select-option v-for="(field, index) in fields" :key="index" :value="field.name"
        >{{ field.label || field.displayName || field.name }}({{ field.ttype }})
      </a-select-option>
    </a-select>
    <a-select
      class="oio-select"
      dropdown-class-name="oio-select-dropdown"
      style="width: 20%; margin-right: var(--oio-margin)"
      :value="exp.operator.val"
      @change="optChange"
    >
      <a-select-option v-for="(opt, index) in operators" :key="index" :value="opt.val">
        {{ opt.name }}
      </a-select-option>
    </a-select>
    <exp-right
      v-if="exp.operator.val !== '=null=true' && exp.operator.val !== '=notnull=true'"
      style="width: 20%; margin-right: var(--oio-margin)"
      :exp="exp"
      :field="field"
      @change-value="$emit('change-value', $event)"
    />
    <oio-button style="vertical-align: top; margin-left: var(--oio-margin)" @click="$emit('delete')">-</oio-button>
  </oio-form-item>
</template>
<script lang="ts">
import { defineComponent, computed, watch, ref } from 'vue';
import { ModelFieldType, IModelField } from '@oinone/kunlun-meta';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { OioButton, OioFormItem } from '@oinone/kunlun-vue-ui-antd';
import { Select as ASelect } from 'ant-design-vue';
import ExpRight from './ExpRight.vue';

export default defineComponent({
  name: 'ExpItem',
  components: {
    ExpRight,
    OioButton,
    OioFormItem,
    ASelect,
    ASelectOption: ASelect.Option
  },
  props: ['exp', 'fields'],
  emits: ['change-field', 'change-opt'],
  setup(props, ctx) {
    const field = ref(props.fields!.find((f) => f.name === props.exp!.left.val) as IModelField);

    watch(
      () => props.fields,
      () => {
        field.value = props.fields!.find((f) => f.name === props.exp!.left.val);
      }
    );

    const fieldChange = (val) => {
      field.value = props.fields!.find((f) => f.name === val) as IModelField;
      ctx.emit('change-field', val);
    };
    const _operators = [
      {
        val: '==',
        name: translateValueByKey('等于'),
        types: [
          ModelFieldType.String,
          ModelFieldType.Phone,
          ModelFieldType.Email,
          ModelFieldType.Integer,
          ModelFieldType.Float,
          ModelFieldType.Currency,
          ModelFieldType.Enum,
          ModelFieldType.Boolean,
          ModelFieldType.Time,
          ModelFieldType.DateTime,
          ModelFieldType.Date,
          ModelFieldType.Text,
          ModelFieldType.ID
        ]
      },
      {
        val: '!=',
        name: translateValueByKey('不等于'),
        types: [
          ModelFieldType.String,
          ModelFieldType.Phone,
          ModelFieldType.Email,
          ModelFieldType.Integer,
          ModelFieldType.Float,
          ModelFieldType.Currency,
          ModelFieldType.Enum,
          ModelFieldType.Boolean,
          ModelFieldType.Time,
          ModelFieldType.DateTime,
          ModelFieldType.Date,
          ModelFieldType.Text,
          ModelFieldType.ID
        ]
      },
      {
        val: '=null=true',
        name: translateValueByKey('为空'),
        types: [
          ModelFieldType.String,
          ModelFieldType.Phone,
          ModelFieldType.Email,
          ModelFieldType.Integer,
          ModelFieldType.Float,
          ModelFieldType.Currency,
          ModelFieldType.Enum,
          ModelFieldType.Boolean,
          ModelFieldType.ManyToOne,
          ModelFieldType.OneToOne,
          ModelFieldType.OneToMany,
          ModelFieldType.Time,
          ModelFieldType.DateTime,
          ModelFieldType.Date,
          ModelFieldType.Text,
          ModelFieldType.ID
        ]
      },
      {
        val: '=notnull=true',
        name: translateValueByKey('不为空'),
        types: [
          ModelFieldType.String,
          ModelFieldType.Phone,
          ModelFieldType.Email,
          ModelFieldType.Integer,
          ModelFieldType.Float,
          ModelFieldType.Currency,
          ModelFieldType.Enum,
          ModelFieldType.Boolean,
          ModelFieldType.ManyToOne,
          ModelFieldType.OneToOne,
          ModelFieldType.OneToMany,
          ModelFieldType.Time,
          ModelFieldType.DateTime,
          ModelFieldType.Date,
          ModelFieldType.Text,
          ModelFieldType.ID
        ]
      },
      {
        val: 'include',
        name: translateValueByKey('包含'),
        types: [ModelFieldType.OneToMany, ModelFieldType.ManyToMany]
      },
      {
        val: 'notinclude',
        name: translateValueByKey('不包含'),
        types: [ModelFieldType.OneToMany, ModelFieldType.ManyToMany]
      },
      {
        val: '=like=',
        name: translateValueByKey('包含'),
        types: [ModelFieldType.String, ModelFieldType.Text, ModelFieldType.Phone, ModelFieldType.Email]
      },
      {
        val: '=notlike=',
        name: translateValueByKey('不包含'),
        types: [ModelFieldType.String, ModelFieldType.Text, ModelFieldType.Phone, ModelFieldType.Email]
      },
      {
        val: '=in=',
        name: translateValueByKey('包含(多值)'),
        types: [
          ModelFieldType.String,
          ModelFieldType.Text,
          ModelFieldType.Phone,
          ModelFieldType.Email,
          ModelFieldType.Integer
        ]
      },
      {
        val: '<',
        name: translateValueByKey('大于'),
        types: [
          ModelFieldType.Float,
          ModelFieldType.Integer,
          ModelFieldType.Time,
          ModelFieldType.DateTime,
          ModelFieldType.Date
        ]
      },
      {
        val: '>',
        name: translateValueByKey('小于'),
        types: [
          ModelFieldType.Float,
          ModelFieldType.Integer,
          ModelFieldType.Time,
          ModelFieldType.DateTime,
          ModelFieldType.Date
        ]
      },
      {
        val: '>=',
        name: translateValueByKey('大于等于'),
        types: [
          ModelFieldType.Float,
          ModelFieldType.Integer,
          ModelFieldType.Time,
          ModelFieldType.DateTime,
          ModelFieldType.Date
        ]
      },
      {
        val: '<=',
        name: translateValueByKey('小于等于'),
        types: [
          ModelFieldType.Float,
          ModelFieldType.Integer,
          ModelFieldType.Time,
          ModelFieldType.DateTime,
          ModelFieldType.Date
        ]
      }
    ];
    const optChange = (opt) => {
      ctx.emit(
        'change-opt',
        _operators.find((o) => o.val === opt)
      );
    };
    const operators = computed(() => {
      return _operators.filter((o) => o.types.includes(field.value && field.value.ttype));
    });
    return { operators, field, fieldChange, optChange };
  }
});
</script>
