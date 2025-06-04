<template>
  <oio-modal
    v-model:visible="visible"
    width="676"
    :get-trigger-container="addRoleDialogContainer"
    :cancel-callback="onCancel"
    :enter-callback="onOk"
  >
    <template #title>
      <span
        >{{ $translate('添加角色') }}
        <span style="font-size: 14px; font-weight: normal" class="ml-2">{{ $translate('为当前权限组添加角色') }}</span>
      </span>
    </template>

    <div class="flex-b-c" style="gap: 10px">
      <oio-input :placeholder="$translate('角色名称')" v-model:value="searchCondition.name" />
      <oio-input :placeholder="$translate('角色编码')" v-model:value="searchCondition.code" />
      <oio-input :placeholder="$translate('角色描述')" v-model:value="searchCondition.description" />
      <oio-button type="primary" @click="onSearch">搜索</oio-button>
      <oio-button @click="onResetCondition">重置</oio-button>
    </div>

    <!-- <div style="margin: 24px 0">
      <oio-button type="primary">创建</oio-button>
    </div> -->

    <a-table
      class="permission-role-table mt-2"
      :dataSource="dataSource"
      :columns="columns"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
      <template v-slot:bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <a-tooltip placement="topLeft">
            <template #title>
              <span>{{ record.name }}</span>
            </template>
            <div style="width: 150px" class="omit">{{ record.name }}</div>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'code'">
          <a-tooltip placement="topLeft">
            <template #title>
              <span>{{ record.code }}</span>
            </template>
            <div style="width: 150px" class="omit">{{ record.code }}</div>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'description'">
          <a-tooltip placement="topLeft">
            <template #title>
              <span>{{ record.description }}</span>
            </template>
            <div style="width: 150px" class="omit">{{ record.description }}</div>
          </a-tooltip>
        </template>
      </template>
    </a-table>

    <div v-if="selectedRowKeys.length">
      <div style="margin: 15px 0" class="bold black">{{ $translate('已选择') }}</div>
      <div class="permission-group-item-group" style="min-height: 50px">
        <div class="permission-group-item-children flex wrap">
          <div class="permission-group-item-children-tag flex-b-c" v-for="item in selectedDataSource" :key="item.key">
            <span>{{ item.name }}</span>
            <oio-icon
              class="ml-2"
              icon="oinone-guanbi1"
              size="10"
              color="var(--oio-default-icon-color)"
              @click="onRemoveRole(item.key)"
            ></oio-icon>
          </div>
        </div>
      </div>
    </div>
  </oio-modal>
</template>
<script lang="ts" setup>
import { ref, watch, defineProps, withDefaults, defineEmits, computed, onMounted, nextTick } from 'vue';
import { OioModal, OioInput, OioButton, OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { queryRoleList } from '../service';

const columns = [
  {
    title: translateValueByKey('角色名称'),
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: translateValueByKey('角色编码'),
    dataIndex: 'code',
    key: 'code'
  },
  {
    title: translateValueByKey('角色描述'),
    dataIndex: 'description',
    key: 'description'
  }
];

const addRoleDialogContainer = () => document.getElementById('permission-config')!;

const props = withDefaults(defineProps<{ modelValue: boolean; activeRoles: any[] }>(), {
  modelValue: false,
  activeRoles: [] as any
});
const emits = defineEmits(['update:modelValue', 'sure', 'close']);
const visible = ref(false);
const allTableData = ref<any[]>([]);
const dataSource = ref<any[]>([]);

const searchCondition = ref({
  name: '',
  code: '',
  description: ''
});

const selectedRowKeys = ref<string[]>([]);
const currentPage = ref(1);

const selectedDataSource = computed(() => {
  return allTableData.value.filter((d) => selectedRowKeys.value.includes(d.key));
});

const init = async () => {
  const value = await queryRoleList({
    currentPage: currentPage.value,
    ...searchCondition.value
  });
  dataSource.value = value.map((v) => ({
    ...v,
    key: v.id
  }));

  if (!allTableData.value.length) {
    allTableData.value = [...dataSource.value];

    if (props.activeRoles && props.activeRoles.length) {
      selectedRowKeys.value = props.activeRoles.map((r) => r.id);
    }

    nextTick(() => {
      const node = document.querySelector('.permission-role-table .ant-pagination') as HTMLElement;

      if (node) {
        node.classList.add('oio-pagination');
      }
    });
  }
};

watch(
  () => props.modelValue,
  (v) => {
    visible.value = v;

    if (v) {
      init();
    }
  },
  { immediate: true }
);

const onCancel = () => {
  emits('update:modelValue', false);
  emits('close');
};

const onOk = () => {
  emits('update:modelValue', false);
  emits('sure', selectedDataSource.value);
};

const onResetCondition = () => {
  searchCondition.value = {
    name: '',
    code: '',
    description: ''
  };
  selectedRowKeys.value = [];
  init();
};

const onSelectChange = (v) => {
  const hasSearchCondition = Object.values(searchCondition.value).some((v) => v);
  let preSelectedKeys: string[] = [];
  if (hasSearchCondition) {
    const dataSourceIds = dataSource.value.map((v) => v.id);
    const invisibleDataSource = allTableData.value.filter((d) => !dataSourceIds.includes(d.id));
    preSelectedKeys = invisibleDataSource.filter((d) => selectedRowKeys.value.includes(d.id)).map((d) => d.id);
  }
  selectedRowKeys.value = [...preSelectedKeys, ...v];
};

const onSearch = () => {
  init();
};

const onRemoveRole = (key) => {
  const index = selectedRowKeys.value.findIndex((s) => s === key);

  index >= 0 && selectedRowKeys.value.splice(index, 1);
};
</script>
