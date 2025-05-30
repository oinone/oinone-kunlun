<template>
  <div class="role-user-config-container">
    <div class="role-user-config-item" v-for="(expressionItem, index) in expressionItemList" :key="expressionItem.key">
      <a-select
        class="oio-select expression-select"
        dropdown-class-name="oio-expression-select-dropdown-global expression-input-operator-dropdown"
        :placeholder="$translate('当前用户/当前角色')"
        v-model:value="expressionItem.values.roleUserEnum"
        @change="onRoleUserEnumChange(expressionItem)"
      >
        <a-select-option
          v-for="item in expressionItem.options.RoleUserOptions"
          :value="item.value"
          :key="item.value"
          :title="$translate(item.label)"
          >{{ $translate(item.label) }}
        </a-select-option>
      </a-select>
      <a-select
        class="oio-select expression-select"
        dropdown-class-name="oio-expression-select-dropdown-global expression-input-operator-dropdown"
        :placeholder="$translate('包含（后面的值可多选）/等于')"
        v-model:value="expressionItem.values.relation"
        @change="onRoleUserValueReset(expressionItem)"
      >
        <a-select-option
          v-for="item in expressionItem.options.RelationOptions"
          :value="item.value"
          :key="item.value"
          :title="$translate(item.label)"
          >{{ $translate(item.label) }}
        </a-select-option>
      </a-select>
      <LazyLoadSelect
        v-model:value="expressionItem.values.roleUserValue"
        :placeholder="$translate('用户列表/角色列表')"
        :isMulti="expressionItem.values.relation === '=in='"
        :fetch-value="expressionItem.options.fetchValue"
        :query-one="expressionItem.options.queryOne"
        @update:resetValue="onRoleUserValueReset(expressionItem)"
        :change="(value) => onRoleUserValueChange(value, expressionItem)"
        relationFieldKey="value"
        :class="successValidates[index] ? 'expression-select' : ''"
      />
      <div
        class="logic-operator-select"
        v-if="index !== expressionItemList.length - 1"
        @click="onLogicOpratorChange(expressionItem)"
      >
        {{ $translate(expressionItem.values.logicOperator) }}
      </div>

      <div class="expression-item-toolbar">
        <a-tooltip :title="$translate('点击添加条件')">
          <i class="d-iconfont oinone-circle-add toolbar-btn" @click="handleAdd()" />
        </a-tooltip>
        <a-tooltip
          :title="$translate('点击删除条件')"
          v-if="index !== 0 || (index === 0 && expressionItemList.length !== 1)"
        >
          <i class="d-iconfont oinone-shanchu toolbar-btn" @click="handleDelete(index)" />
        </a-tooltip>
        <i class="d-iconfont toolbar-btn" v-else />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { OioSelect } from '@kunlun/vue-ui-antd';
import { isEmpty } from 'lodash-es';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import LazyLoadSelect from '../components/LazyLoadSelect.vue';
import { HomepageSettingCondition } from '../service/HomepageSettingCondition';
import {
  ExpressionItem,
  FetchValueOptions,
  FetchValueReturnType,
  LogicOperatorEnum,
  RelationOptions,
  RelationOptionsEnum,
  RoleUserOptions,
  RoleUserOptionsEnum
} from '../typing';

export default defineComponent({
  name: 'RoleConfig',
  components: {
    OioSelect,
    LazyLoadSelect
  },
  props: {
    moduleName: {
      type: String,
      default: ''
    },
    successValidates: {
      type: Array as PropType<Array<boolean>>,
      required: true
    },
    roleUserConfigchange: {
      type: Function
    },
    initialExpressionValueList: {
      type: Object as PropType<ExpressionItem[]>
    },
    handleFetchRole: {
      type: Function as PropType<(options: FetchValueOptions) => Promise<FetchValueReturnType>>,
      required: true
    },
    handleFetchUser: {
      type: Function as PropType<(options: FetchValueOptions) => Promise<FetchValueReturnType>>,
      required: true
    },
    handleRoleQueryOne: {
      type: Function as PropType<(id: string) => Promise<Record<string, unknown>>>,
      required: true
    },
    handleUserQueryOne: {
      type: Function as PropType<(id: string) => Promise<Record<string, unknown>>>,
      required: true
    }
  },
  setup(props) {
    const expressionItemList = ref<ExpressionItem[]>(
      props.initialExpressionValueList
        ? props.initialExpressionValueList
        : [
            {
              options: {
                RoleUserOptions: RoleUserOptions,
                RelationOptions: RelationOptions,
                fetchValue: props.handleFetchUser,
                queryOne: props.handleUserQueryOne
              },
              values: {
                roleUserEnum: RoleUserOptionsEnum.CurrentUser,
                relation: RelationOptionsEnum.Include,
                roleUserValue: [],
                logicOperator: LogicOperatorEnum.And
              },
              key: Date.now().toString()
            }
          ]
    );

    const handleAdd = () => {
      expressionItemList.value.push({
        options: {
          RoleUserOptions: RoleUserOptions,
          RelationOptions: RelationOptions,
          fetchValue: props.handleFetchUser,
          queryOne: props.handleUserQueryOne
        },
        values: {
          roleUserEnum: RoleUserOptionsEnum.CurrentUser,
          relation: RelationOptionsEnum.Include,
          roleUserValue: [],
          logicOperator: LogicOperatorEnum.And
        },
        key: Date.now().toString()
      });
    };
    const handleDelete = (index: number) => {
      expressionItemList.value.splice(index, 1);
    };

    const onRoleUserEnumChange = (expressionItem: ExpressionItem) => {
      if (expressionItem.values.roleUserEnum === RoleUserOptionsEnum.CurrentUser) {
        expressionItem.options.fetchValue = props.handleFetchUser;
        expressionItem.options.queryOne = props.handleUserQueryOne;
      } else {
        expressionItem.options.fetchValue = props.handleFetchRole;
        expressionItem.options.queryOne = props.handleRoleQueryOne;
      }
      onRoleUserValueReset(expressionItem);
    };

    const onLogicOpratorChange = (expressionItem: ExpressionItem) => {
      const logicOperatorEnum = Object.values(LogicOperatorEnum);
      const index = logicOperatorEnum.indexOf(expressionItem.values.logicOperator);
      expressionItem.values.logicOperator = logicOperatorEnum[(index + 1) % logicOperatorEnum.length];
    };

    const onRoleUserValueReset = (expressionItem: ExpressionItem) => {
      if (expressionItem.values.relation === RelationOptionsEnum.Equal) {
        expressionItem.values.roleUserValue = {};
      } else {
        expressionItem.values.roleUserValue = [];
      }
    };

    const onRoleUserValueChange = (value, expressionItem: ExpressionItem) => {
      expressionItem.values.roleUserValue = value;
    };

    const generateConditionForItem = (expressionItem: ExpressionItem) => {
      let condition: HomepageSettingCondition;
      const item = expressionItem.values;
      switch (item.relation) {
        // item.roleUserValue 是对象
        case RelationOptionsEnum.Equal:
          condition = new HomepageSettingCondition(item.roleUserEnum).equal(item.roleUserValue.value);
          break;
        // item.roleUserValue 是对象数组
        case RelationOptionsEnum.Include:
          condition = new HomepageSettingCondition(item.roleUserEnum).in(item.roleUserValue.map((arr) => arr.value));
          break;
        default:
          console.error('relation not support');
          break;
      }
      return condition!;
    };

    const finalExpression = computed(() => {
      const l = expressionItemList.value.length;
      if (l === 0) {
        return '';
      }
      let condition: HomepageSettingCondition;

      let isFirst = true;
      for (let left = 0; left < l; left++) {
        const curr = expressionItemList.value[left];
        const last = expressionItemList.value[left - 1];
        if (
          !curr.values.logicOperator ||
          !curr.values.relation ||
          !curr.values.roleUserEnum ||
          isEmpty(curr.values.roleUserValue)
        ) {
          continue;
        }
        if (isFirst) {
          condition = generateConditionForItem(curr);
          isFirst = false;
        } else {
          const currCondition = generateConditionForItem(curr);
          switch (last.values.logicOperator) {
            case LogicOperatorEnum.And:
              condition = condition!.and(currCondition);
              break;
            case LogicOperatorEnum.Or:
              condition = condition!.or(currCondition);
              break;
            default:
              break;
          }
        }
      }
      return condition! ? condition.toString() : '';
    });

    watch(
      () => finalExpression.value,
      (val) => {
        props.roleUserConfigchange?.(
          JSON.stringify(JSON.stringify(expressionItemList.value.map((item) => item.values))),
          val
        );
      },
      { deep: true, immediate: true }
    );

    return {
      expressionItemList,

      handleAdd,
      handleDelete,
      onRoleUserEnumChange,
      onLogicOpratorChange,
      onRoleUserValueReset,
      onRoleUserValueChange
    };
  }
});
</script>
<style lang="scss">
.role-user-config-container {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  gap: 16px;

  & > .role-user-config-item {
    position: relative;
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 16px;

    .expression-select.oio-select.ant-select {
      .ant-select-selector {
        border-color: var(--oio-select-border-color) !important;
      }
    }

    .expression-select {
      .oio-select.ant-select {
        .ant-select-selector {
          border-color: var(--oio-select-border-color) !important;
        }
      }
    }

    & > .form-single-select {
      width: calc(27.2% - 8px);
    }

    & > .form-multi-select {
      width: calc(27.2% - 8px);
    }

    & > .oio-select {
      width: calc(27.2% - 8px);
    }

    & > .logic-operator-select {
      width: 32px;
      border: none;
      background-color: var(--oio-input-tag-background);
      color: var(--oio-primary-color);
    }

    & > .expression-item-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;

      & > .toolbar-btn {
        cursor: pointer;
      }
    }
  }
}
</style>