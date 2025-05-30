<template>
  <div class="form-biz-audit-field">
    <oio-input v-model:value="searchFieldKeyword" :placeholder="translateValueByKey('请使用名称进行搜索')">
      <template #prefix>
        <oio-icon icon="oinone-sousuo" size="14" />
      </template>
    </oio-input>
    <div class="tree-area">
      <a-tree
        v-if="valListRef"
        class="oio-tree"
        :fieldNames="fieldNames"
        :defaultExpandAll="false"
        :selectable="false"
        :showIcon="true"
        :checkable="true"
        :tree-data="valListRef"
        v-model:checkedKeys="innerCheckedKeys"
        @check="checkNode"
      >
        <template #title="context">
          <div class="form-biz-audit-field-label">
            <oio-icon
              :icon="context.fieldList ? 'oinone-moxing' : 'oinone-caidan'"
              size="14"
              :color="context.fieldList ? 'var(--oio-primary-color)' : undefined"
            />
            <span v-if="context.fieldName.indexOf(searchFieldKeyword) > -1">
              {{ context.fieldName.substr(0, context.fieldName.indexOf(searchFieldKeyword)) }}
              <span style="color: #f50">{{ searchFieldKeyword }}</span
              >{{ context.fieldName.substr(context.fieldName.indexOf(searchFieldKeyword) + searchFieldKeyword.length) }}
              <span> - {{ context.fieldCode }}</span>
            </span>
            <span v-else>{{ context.fieldName }} - {{ context.fieldCode }}</span>
          </div>
        </template>
      </a-tree>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { OioIcon } from '@kunlun/vue-ui-common';
import { translateValueByKey } from '@kunlun/engine';
import { Tree as ATree } from 'ant-design-vue';
import { OioInput } from '@kunlun/vue-ui-antd';
import { collectSelectedKeys } from './service';

export default defineComponent({
  inheritAttrs: false,
  props: {
    value: {
      type: String
    },
    selectedFields: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    change: {
      type: Function,
      default: () => {}
    }
  },
  components: {
    OioIcon,
    OioInput,
    ATree
  },
  setup(props) {
    const searchFieldKeyword = ref('');
    const fieldNames = { children: 'fieldList', title: 'fieldName', key: 'key' };
    const innerCheckedKeys = ref<string[]>([]);
    const valListRef = ref<Record<string, unknown>[]>([]);
    watch(
      () => props.value,
      (val) => {
        let valList = [];
        if (val) {
          valList = JSON.parse(val);
        }
        innerCheckedKeys.value = [];
        collectSelectedKeys(innerCheckedKeys.value, valList);
        valListRef.value = valList;
      }
    );
    const filterNodeFunction = (node) => {
      if (node.fieldName.indexOf(searchFieldKeyword.value) > -1) {
        return true;
      }
      return false;
    };
    const checkNode = (checkedKeys, e) => {
      e.node.dataRef.isSelected = e.checked;
      if (!e.node.parent && e.node.fieldList) {
        e.node.fieldList.forEach((c) => (c.isSelected = e.checked));
      }
      props.change(JSON.stringify(valListRef.value));
    };
    return {
      fieldNames,
      valListRef,
      innerCheckedKeys,
      searchFieldKeyword,
      checkNode,
      filterNodeFunction,
      translateValueByKey
    };
  }
});
</script>
<style lang="scss">
.form-biz-audit-field {
  width: 50%;

  .tree-area {
    margin-top: 16px;

    .ant-tree-checkbox-indeterminate .ant-tree-checkbox-inner:after {
      background-color: var(--oio-primary-color);
    }

    .form-biz-audit-field-label {
      display: flex;
      align-items: center;

      .oio-icon {
        margin-right: 8px;
      }
    }
  }
}
</style>
