<template>
  <div class="translate-toolbox-wrapper">
    <div class="translate-toolbox-button">
      <oio-icon icon="oinone-gongju" size="18" />
    </div>
    <div class="translate-toolbox-select-wrapper">
      <div class="translate-toolbox-select-option" @click="openAddModal">
        <oio-icon icon="oinone-tianjiafanyi" size="12" />
        <span class="translate-toolbox-select-label">{{ translateValueByKey('添加翻译项') }}</span>
      </div>
      <div class="translate-toolbox-select-option" @click="openUpdateModal">
        <oio-icon icon="oinone-genggaifanyi" size="12" />
        <span class="translate-toolbox-select-label">{{ translateValueByKey('更改翻译项') }}</span>
      </div>
    </div>
    <a-modal
      v-model:visible="modalVisible"
      :title="translateValueByKey(currentModeText.modalTitle)"
      :width="960"
      style="top: 7.5vh"
      @cancel="clearModalState"
    >
      <template #footer>
        <a-button
          key="confirm"
          type="primary"
          @click="handleModalConfirm"
          :disabled="!translated.length || !currentTranslate || currentTranslate.id === '-1'"
        >
          {{ translateValueByKey('确定') }}
        </a-button>
        <a-button
          key="refresh"
          type="primary"
          @click="handleModalRefresh"
          :disabled="!translated.length || !currentTranslate || currentTranslate.id === '-1'"
        >
          {{ translateValueByKey('确定并刷新') }}
        </a-button>
      </template>
      <div class="translate-toolbox-modal-content">
        <div class="translate-toolbox-modal-left">
          <div class="translate-select-item-label">{{ translateValueByKey(currentModeText.leftTitle) }}</div>
          <a-select
            show-search
            :placeholder="translateValueByKey(currentModeText.leftSelectPlhd)"
            :open="selectOpen"
            style="width: 100%; margin-bottom: var(--oio-margin-lg)"
            :filter-option="false"
            :search-value="searchValue"
            v-model:value="selectValue"
            mode="multiple"
            :autoClearSearchValue="false"
            @search="handleSearch"
            @change="handleChange"
            @dropdownVisibleChange="handleSelectVisible"
          >
            <template #notFoundContent>
              <div v-if="selectLoading" class="translate-toolbox-modal-select__loading">
                <oio-spin size="small" loading />
              </div>
              <div v-else>{{ translateValueByKey('暂无数据') }}</div>
            </template>
            <a-select-option v-for="option in filterOptions" :value="option.origin" :key="option.origin">
              {{ option[currentModeLabel] }}
            </a-select-option>
          </a-select>
          <div class="translate-select-item-label">{{ translateValueByKey(currentModeText.leftList) }}</div>
          <div v-if="translated.length" class="translate-item-content">
            <div
              v-for="(translate, index) in translated"
              :key="translate.origin + translate.module"
              :class="[
                'translate-item-row',
                index === currentTranslateIndex ? 'translate-item-row__current' : '',
                translate.validator === false ? 'translate-item-row__error' : ''
              ]"
              @click="() => onSelectedItemClick(index)"
            >
              <div>{{ translate[currentModeLabel] }}</div>
              <oio-icon icon="oinone-shanchu" size="14" @click.stop="() => onDeleteLabel(index)" />
            </div>
          </div>
          <div v-else class="translate-select-not-found">
            <img :src="notFoundTranslatedImg" />
            <div>{{ translateValueByKey(currentModeText.leftEmpty) }}</div>
          </div>
        </div>
        <div class="translate-toolbox-modal-right oio-scrollbar">
          <div v-if="currentTranslate && currentTranslate.id !== '-1'">
            <oio-form ref="formRef" :data="currentTranslate" :layout="FormLayout.VERTICAL">
              <oio-form-item :label="translateValueByKey('源语言所在应用')">
                <span class="translate-toolbox-form-value">
                  {{ translateValueByKey(currentTranslate.moduleDefinition.displayName) }}
                </span>
              </oio-form-item>
              <oio-form-item name="origin" :label="translateValueByKey('源术语')">
                <span class="translate-toolbox-form-value"> {{ currentTranslate.origin }}</span>
              </oio-form-item>
              <oio-form-item name="resLang" :label="translateValueByKey('源语言')">
                <span class="translate-toolbox-form-value"> {{ currentTranslate.resLang.name }}</span>
              </oio-form-item>
              <oio-form-item name="lang" :label="translateValueByKey('目标语言')">
                <span class="translate-toolbox-form-value"> {{ currentTranslate.lang.name }}</span>
              </oio-form-item>
              <oio-form-item name="target" :label="translateValueByKey('翻译值')" required>
                <oio-input v-model:value="currentTranslate.target" />
              </oio-form-item>
              <oio-form-item name="scope" :label="translateValueByKey('翻译应用范围')" required>
                <a-select v-model:value="currentTranslate.scope">
                  <a-select-option :value="TranslateScopeValue.global">
                    {{ translateValueByKey('全局') }}
                  </a-select-option>
                  <a-select-option :value="TranslateScopeValue.module">
                    {{ translateValueByKey('源术语所在应用') }}
                  </a-select-option>
                </a-select>
              </oio-form-item>
              <oio-form-item name="state" :label="translateValueByKey('激活状态')" required>
                <a-radio-group name="state" v-model:value="currentTranslate.state">
                  <a-radio :value="true">{{ translateValueByKey('激活') }}</a-radio>
                  <a-radio :value="false">{{ translateValueByKey('不激活') }}</a-radio>
                </a-radio-group>
              </oio-form-item>
            </oio-form>
          </div>
          <div v-else class="translate-select-not-found">
            <img :src="notSelectTranslateImg" />
            <div>{{ translateValueByKey(currentModeText.rightEmpty) }}</div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, nextTick } from 'vue';
import {
  Modal as AModal,
  Select as ASelect,
  SelectOption as ASelectOption,
  RadioGroup as ARadioGroup,
  Radio as ARadio
} from 'ant-design-vue';
import { SelectValue } from 'ant-design-vue/lib/select';
import {
  OioIcon,
  OioForm,
  OioFormItem,
  OioInput,
  FormLayout,
  OioMessage,
  OioFormInstance,
  OioSpin
} from '@oinone/kunlun-vue-ui-antd';
import { getUrlParamByKey, translateValueByKey, CurrentLanguage, genStaticPath, OioProvider } from '@oinone/kunlun-engine';
import { IModelField, ModelFieldType } from '@oinone/kunlun-meta';
import { buildSingleItemParam } from '@oinone/kunlun-service';
import { queryTranslateBox, queryTranslateBoxUpdate, saveAndRefreshForBox, saveForBoxWithUpdate } from '../../service';
import { SearchCommonParams, TranslateManageItem, TranslateMode, TranslateScopeValue } from '../typings';
import { defaultCurrentTranslate, translateAddText, translateUpdateText } from './constants';

const notFoundTranslatedImg = genStaticPath('not-found-translated.png?x-oss-process=image/resize,m_lfit,h_800');
const notSelectTranslateImg = genStaticPath('not-select-translate.png?x-oss-process=image/resize,m_lfit,h_800');

const modalVisible = ref(false);

const translated = ref<TranslateManageItem[]>([]);

const currentTranslateIndex = ref(-1);

const currentTranslate = computed(() => {
  if (currentTranslateIndex.value < 0) {
    return defaultCurrentTranslate;
  }
  return translated.value[currentTranslateIndex.value];
});

const currentMode = ref<TranslateMode>(TranslateMode.ADD);

const options = ref<TranslateManageItem[]>([]);

const searchValue = ref('');

const selectValue = ref([]);

const formRef = ref<OioFormInstance>(null as any);

const selectOpen = ref(false);

const selectLoading = ref(false);

const filterOptions = computed(() => {
  const resultOptions = options.value.filter((o) => translated.value.findIndex((t) => t.origin === o.origin) < 0);
  if (searchValue.value) {
    const labelMap = { [TranslateMode.ADD]: 'origin', [TranslateMode.UPDATE]: 'target' };
    return resultOptions.filter((r) => r[labelMap[currentMode.value]].includes(searchValue.value));
  }
  return resultOptions;
});

const currentModeText = computed(() => {
  const TextMap = { [TranslateMode.ADD]: translateAddText, [TranslateMode.UPDATE]: translateUpdateText };
  return TextMap[currentMode.value];
});

const currentModeLabel = computed(() => {
  const labelMap = { [TranslateMode.ADD]: 'origin', [TranslateMode.UPDATE]: 'target' };
  return labelMap[currentMode.value];
});

const handleSelectVisible = (val) => {
  selectOpen.value = val;
};

const getSearchParams = async () => {
  const moduleName: string = getUrlParamByKey('module');
  const model: string = getUrlParamByKey('model');
  const action: string = getUrlParamByKey('action');
  const lang = await CurrentLanguage.get();
  return { moduleName, model, action, langCode: lang!.code } as SearchCommonParams;
};

const initModalOptions = async () => {
  selectLoading.value = true;
  const fetchFunction = {
    [TranslateMode.ADD]: queryTranslateBox,
    [TranslateMode.UPDATE]: queryTranslateBoxUpdate
  }[currentMode.value];
  const params = await getSearchParams();
  const data = await fetchFunction(params);
  options.value = data;
  selectLoading.value = false;
};

const openAddModal = async () => {
  currentMode.value = TranslateMode.ADD;
  initModalOptions();
  modalVisible.value = true;
};

const openUpdateModal = async () => {
  currentMode.value = TranslateMode.UPDATE;
  initModalOptions();
  modalVisible.value = true;
};

const handleSearch = async (val: unknown) => {
  searchValue.value = val as string;
};

const handleChange = (originList: SelectValue) => {
  const origin = (originList as string[])[0] ?? '';
  const index = options.value.findIndex((v) => v.origin === origin);
  translated.value.push(options.value[index]);
  currentTranslateIndex.value = translated.value.length - 1;
  selectValue.value = [];
  selectOpen.value = false;
};

const onSelectedItemClick = (index: number) => {
  currentTranslateIndex.value = index;
  nextTick(() => {
    if (typeof currentTranslate.value.validator === 'boolean') {
      validateForm();
    }
  });
};

const clearModalState = () => {
  translated.value = [];
  options.value = [];
  currentTranslateIndex.value = -1;
  searchValue.value = '';
  selectValue.value = [];
};

const buildSaveParams = async ({ refresh }) => {
  const translationItemsField = [
    { name: 'origin', ttype: ModelFieldType.String },
    { name: 'target', ttype: ModelFieldType.String },
    { name: 'scope', ttype: ModelFieldType.Enum },
    { name: 'state', ttype: ModelFieldType.Boolean }
  ];
  if (refresh) {
    translationItemsField.push({ name: 'id', ttype: ModelFieldType.String });
  }
  const modelFields = [
    { name: 'moduleName', ttype: ModelFieldType.String },
    { name: 'langCode', ttype: ModelFieldType.String },
    { name: 'resLangCode', ttype: ModelFieldType.String },
    {
      name: 'translationItems',
      ttype: ModelFieldType.OneToMany,
      modelFields: translationItemsField
    }
  ] as IModelField[];
  const moduleName: string = getUrlParamByKey('module');
  const langCode: string = (await CurrentLanguage.get())!.code;
  const resLangCode: string = OioProvider.getConfig().language as string;
  const gqlStr = await buildSingleItemParam(modelFields, {
    moduleName,
    langCode,
    resLangCode,
    translationItems: translated.value
  });
  return gqlStr;
};

const validateTranslateList = () => {
  let passed = true;
  translated.value.forEach((t) => {
    if (!t.target) {
      passed = false;
      t.validator = false;
    } else {
      t.validator = true;
    }
  });
  return passed;
};

const validateForm = async () => {
  try {
    await formRef.value.validate();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const handleModalConfirm = async () => {
  if (currentTranslateIndex.value < 0) {
    return;
  }
  const validate = validateTranslateList();
  if (!validate) {
    await validateForm();
    return;
  }
  const gqlStr = await buildSaveParams({ refresh: false });
  await saveForBoxWithUpdate(gqlStr);
  modalVisible.value = false;
  clearModalState();
  OioMessage.success(translateValueByKey('操作成功'));
};

const handleModalRefresh = async () => {
  if (currentTranslateIndex.value < 0) {
    return;
  }
  const validate = validateTranslateList();
  if (!validate) {
    await validateForm();
    return;
  }
  const gqlStr = await buildSaveParams({ refresh: true });
  await saveAndRefreshForBox(gqlStr);
  modalVisible.value = false;
  clearModalState();
  OioMessage.success(translateValueByKey('操作成功'));
  window.location.reload();
};

const onDeleteLabel = (index: number) => {
  if (index < currentTranslateIndex.value) {
    currentTranslateIndex.value -= 1;
  } else if (index === currentTranslateIndex.value) {
    currentTranslateIndex.value = -1;
  }
  translated.value.splice(index, 1);
};
</script>
<style lang="scss">
.translate-toolbox-wrapper {
  position: fixed;
  bottom: 114px;
  right: 16px;
  z-index: 999999;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 64px;
  height: 64px;
  .translate-toolbox-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--oio-background);
    box-shadow: var(--oio-select-dropdown-box-shadow);

    svg {
      color: var(--oio-text-color-secondary);
      transition: color 0.3s ease-in-out;
    }
  }
  .translate-toolbox-select-wrapper {
    position: absolute;
    right: 64px;
    width: max-content;
    height: 84px;
    display: flex;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    flex-direction: column;
    justify-content: center;
    background: var(--oio-background);
    box-shadow: var(--oio-select-dropdown-box-shadow);
    border-radius: var(--oio-border-radius-lg);

    .translate-toolbox-select-option {
      width: 100%;
      height: 32px;
      padding: 0 12px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: var(--oio-font-size);
      color: var(--oio-text-color-secondary);

      .translate-toolbox-select-label {
        margin-left: var(--oio-margin-sm);
      }

      svg {
        color: var(--oio-text-color-secondary);
      }

      &:hover {
        background-color: rgba(var(--oio-select-item-readonly-bg), 0.1);
        color: var(--oio-select-item-readonly-color);

        svg {
          color: var(--oio-select-item-readonly-color);
        }
      }
    }
  }

  &:hover {
    > .translate-toolbox-select-wrapper {
      visibility: visible;
      opacity: 1;
    }
    svg {
      color: var(--oio-select-item-readonly-color);
    }
  }
}

.translate-toolbox-modal-content {
  margin: -24px;
  display: flex;

  .translate-toolbox-modal-left {
    padding: var(--oio-padding-lg);
    width: 45%;
    border-right: 1px solid #e8e8e8;

    .translate-select-not-found {
      height: calc(70vh - 130px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: var(--oio-font-size);
      color: var(--oio-placeholder-color);

      img {
        width: 60px;
        height: 60px;
        margin-bottom: var(--oio-margin-sm);
      }
    }
    .translate-item-content {
      height: calc(70vh - 130px);
    }
  }

  .translate-toolbox-modal-right {
    padding: var(--oio-padding-lg);
    flex: 1;
    height: 70vh;
    overflow-y: scroll;

    .translate-select-not-found {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: var(--oio-font-size);
      color: var(--oio-placeholder-color);

      img {
        width: 70px;
        height: 70px;
        margin-bottom: var(--oio-margin-sm);
      }
    }
    .translate-item-content {
      height: 100%;
    }
  }

  .translate-select-item-label {
    color: var(--oio-text-color);
    font-size: var(--oio-font-size);
    font-weight: var(--oio-font-weight-bold);
    margin-bottom: var(--oio-margin-sm);
  }

  .translate-item-content {
    overflow-y: scroll;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .translate-item-row {
    display: flex;
    height: 40px;
    padding: 0 var(--oio-padding-md);
    background: var(--oio-background);
    border-radius: var(--oio-border-radius-sm);
    justify-content: space-between;
    align-items: center;
    color: var(--oio-text-color-secondary);

    svg {
      display: none;
    }

    &:hover {
      background-color: rgba(var(--oio-select-item-readonly-bg), 0.1);
      color: var(--oio-select-item-readonly-color);
      cursor: pointer;

      svg {
        display: inline-block;
        color: var(--oio-select-item-readonly-color);
      }
    }
  }

  .translate-item-row__current {
    background-color: rgba(var(--oio-select-item-readonly-bg), 0.05);
    color: var(--oio-select-item-readonly-color);

    svg {
      display: inline-block;
      color: var(--oio-select-item-readonly-color);
    }
  }

  .translate-item-row__error {
    color: var(--oio-error-color) !important;
    background-color: rgba(var(--oio-error-color-rgb), 0.05) !important;
    svg {
      color: var(--oio-error-color) !important;
    }

    &:hover {
      background-color: rgba(var(--oio-error-color-rgb), 0.1) !important;
    }
  }

  .translate-toolbox-form-value {
    font-size: var(--oio-font-size);
    color: var(--oio-text-color-secondary);
  }
}

.translate-toolbox-modal-select__loading {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
