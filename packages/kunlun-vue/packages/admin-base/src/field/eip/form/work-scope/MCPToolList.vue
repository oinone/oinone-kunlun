<template>
  <div class="work-scope-field-widget">
    <AInputSearch @search="onSearch" />
    <a-checkbox-group :value="currentValue" @change="onCheck" style="width: 100%;">
      <a-row align="middle">
        <a-col class="mcp-tool-check-col" :span="24" v-for="option in filteredOptions" :key="option.interfaceName">
          <a-checkbox :value="option.interfaceName" :disabled="readonly">
            <div class="mcp-tool-check-item">
              <span class="mcp-tool-check-label">{{ option.name }}</span>
              <span class="mcp-tool-check-description">{{ option.description }}</span>
            </div>
          </a-checkbox>
        </a-col>
      </a-row>
    </a-checkbox-group>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, defineProps, withDefaults, onMounted } from 'vue';
import { queryMCPToolInterface } from './service';
import { CheckboxGroup as ACheckboxGroup, InputSearch as AInputSearch, Row as ARow, Col as ACol } from 'ant-design-vue';

interface InterfaceItem {
  interfaceName: string;
}

const props = withDefaults(
  defineProps<{
    value?: InterfaceItem[];
    change?: (value: InterfaceItem[]) => void;
    readonly: boolean
  }>(),
  {
    value: () => [],
    change: () => {},
    readonly: false
  }
);

const checkboxOptions = ref<any[]>([]);
const filteredOptions = ref<any[]>([]);

const currentValue = computed(() => {
  const value =  (props.value || []).map((v: InterfaceItem) => v.interfaceName);
  return value;
});

const init = async () => {
  const sourceData = await queryMCPToolInterface();
  checkboxOptions.value = sourceData.map((item) => ({
    ...item,
    label: item.name,
    value: item.interfaceName,
    name: item.name
  }));
  filteredOptions.value = checkboxOptions.value;
};

onMounted(init);

const onSearch = (value: string) => {
  if(!value){
    filteredOptions.value = checkboxOptions.value;
    return;
  }
  const currOptions = checkboxOptions.value.filter((option) =>
    option.name.includes(value)
  );
  filteredOptions.value = currOptions;
};


const onCheck = (val) => {
  const value = val.filter((v) => !checkboxOptions.value.find((t) => t.code === v)).map((v) => ({ interfaceName: v }));
  props.change(value);
};


</script>
<style lang="scss">
.work-scope-field-widget {
  padding: calc(var(--oio-padding) - 4px) calc(var(--oio-padding) - 8px) calc(var(--oio-padding) - 4px)
    calc(var(--oio-padding) - 8px);
  background: rgba(3, 93, 255, 0.05);
  border: 1px solid #035bff0e;
  border-radius: 4px;
  margin-bottom: var(--oio-margin);

  .ant-tree {
    background: transparent;

    .ant-tree-checkbox-indeterminate .ant-tree-checkbox-inner:after {
      background-color: var(--oio-primary-color);
    }

    .ant-tree-switcher {
      color: var(--oio-icon-color);
    }
  }
  .mcp-tool-check-col{
    padding: 8px;
    border: 1px solid var(--oio-border-color);
    border-radius: var(--oio-border-radius);
    margin-top: 8px;
    display: flex;
    .ant-checkbox-wrapper{
      align-items: center;
    }
  }
  .mcp-tool-check-item{
    display: flex;
    flex-direction: column;
  }
  .mcp-tool-check-label{
    font-weight: bold;
  }
  .mcp-tool-check-description{
    font-size: 12px;
    color: var(--oio-text-color-secondary);
  }
}
</style>
