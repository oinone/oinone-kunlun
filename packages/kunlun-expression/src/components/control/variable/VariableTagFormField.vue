<template>
  <a-popover
    overlay-class-name="expression-common-popover"
    :get-popup-container="getPopupContainer"
    placement="bottomLeft"
    :visible="isShowDropdown"
  >
    <template #default>
      <span
        ref="variableFieldRef"
        class="variable-tag-form-field"
        :class="{
          [`variable-tag-form-field-${size}`]: true,
          'variable-input-form-field-readonly': readonly,
          'variable-tag-form-field-string': isStringMode,
          'variable-tag-form-field-variable': isVariableMode
        }"
      >
        <control-tag class="variable-control-tag" :size="size" :closable="isShowClear" @close="onClear">
          <template #prefix>
            <span class="variable-type-addon" v-if="showTypeSelect">
              <a-select
                v-model:value="variableType"
                :options="variableItemTypeList"
                dropdown-class-name="variable-type-addon-dropdown oio-expression-select-dropdown-global"
                size="small"
                :dropdown-match-select-width="false"
                :get-popup-container="(triggerNode) => triggerNode.parentNode"
                @change="onChangeVariableType"
              >
                <a-select-option v-for="opt in variableItemTypeList" :value="opt.value">{{
                  translateExpValue(opt.label)
                }}</a-select-option>
              </a-select>
            </span>
          </template>
          <template #default>
            <span
              class="variable-tag-form-field-input"
              ref="variableItemListRef"
              :class="{ 'only-one-input': isOnlyOneInput }"
            >
              <span class="ant-input-inner" @click="(e) => isVariableMode && onAddVariableItem('input')">
                <span
                  class="variable-item variable-string placeholder"
                  v-if="isVariableMode && !variableItemNum && !valueList[0].value"
                >
                  {{ innerPlaceholder }}
                </span>
                <template v-for="(variableItem, index) in variableItemList">
                  <span
                    class="variable-item variable-string"
                    :class="[`variable-item-${index}`, !variableItem.value ? 'variable-string-empty' : '']"
                    v-if="variableItem.type === 'string' && allowString"
                  >
                    <template v-if="!isDateTtype(leftJoinTtype)">
                      <input
                        v-model="variableItem.value"
                        type="text"
                        :pattern="createInputPatternByTtype(leftJoinTtype)"
                        :maxlength="variableMaxStringLength"
                        :placeholder="
                          showTypeSelect && variableType === 'string'
                            ? innerPlaceholder
                            : isOnlyOneInput
                            ? innerPlaceholder
                            : ''
                        "
                        class="variable-item-input ant-input"
                        @change.keypress.keyup.keydown="onChangeVariableItemString(index)"
                        :ref="(el) => setVariableItemInputRef(el, index)"
                      />
                      <span class="variable-item-input-mirror" :ref="(el) => setVariableItemInputMirrorRef(el, index)">
                        <template v-if="!variableItem.value">&nbsp;</template>
                        <template v-else>{{ variableItem.value }}</template>
                      </span>
                    </template>
                    <!-- TODO 日期类型 -->
                    <template v-else>
                      <oio-date-time-picker
                        v-if="leftJoinTtype == 'DATETIME'"
                        v-model:value="variableItem.value"
                        :allow-clear="false"
                        dropdown-class-name="expression-date-picker-popup"
                      />
                      <oio-date-picker
                        v-else-if="leftJoinTtype == 'DATE'"
                        v-model:value="variableItem.value"
                        :allow-clear="false"
                        dropdown-class-name="expression-date-picker-popup"
                      />
                      <oio-time-picker
                        v-else-if="leftJoinTtype == 'TIME'"
                        v-model:value="variableItem.value"
                        :allow-clear="false"
                        dropdown-class-name="expression-date-picker-popup"
                      />
                      <oio-year-picker
                        v-else-if="leftJoinTtype == 'YEAR'"
                        v-model:value="variableItem.value"
                        :allow-clear="false"
                        dropdown-class-name="expression-date-picker-popup"
                      />
                    </template>
                  </span>
                  <control-tag
                    v-if="
                      variableItem.type === 'variable' ||
                      variableItem.type === 'option' ||
                      variableItem.type === 'field'
                    "
                    :size="size"
                    class="variable-item variable-tag"
                    :class="`variable-item-${index}`"
                    :title="labelViewType === 'API_NAME' ? variableItem.apiName : variableItem.displayName"
                    :desc="labelViewType === 'API_NAME' ? '' : variableItem.subTitle"
                    :closable="!readonly && !showTypeSelect"
                    @close="onCloseTagItem(index)"
                  />
                </template>
              </span>
            </span>
          </template>
          <template #addOn v-if="!showTypeSelect">
            <a-tooltip
              :title="`${translateExpValue('最多只能选')}${maxVariableNum}${translateExpValue('个字段')}`"
              v-if="!readonly && variableItemNum >= maxVariableNum"
            >
              <span class="control-tag-close-btn">
                <i class="d-iconfont" :class="[isFieldMode ? 'oinone-data-label' : 'oinone-variable-x']" />
              </span>
            </a-tooltip>
            <span class="control-tag-close-btn" v-else-if="!readonly" @click="onAddVariableItem('suffix')">
              <i class="d-iconfont" :class="[isFieldMode ? 'oinone-data-label' : 'oinone-variable-x']" />
            </span>
          </template>
        </control-tag>
      </span>
    </template>
    <template #content>
      <div ref="dropdownRef">
        <expression-designer-cascader
          :class="{ 'field-mode-dropdown': isFieldMode }"
          :options="availableOptions"
          :load-data="fetchChildren"
          :pagination="pagination"
          :change-on-select="changeOnSelect"
          :on-pagination-change="onPaginationChange"
          @change="onSelectVariable"
        >
          <template #header v-if="isFieldMode">
            <div class="variable-input-form-field-dropdown-header">
              <oio-input
                class="selection-search-input"
                size="small"
                v-model:value="fieldKeywords"
                allow-clear
                :placeholder="translateExpValue('输入名称搜索')"
              />
            </div>
          </template>
          <template #header v-else-if="!isSimpleMode">
            <div class="variable-input-form-field-dropdown-header">
              <oio-input
                class="selection-search-input"
                size="small"
                v-model:value="searchKeywords"
                allow-clear
                :placeholder="translateExpValue('输入模型名称搜索')"
                @change="onSearchKeywordsChange"
              />
            </div>
          </template>
        </expression-designer-cascader>
      </div>
    </template>
  </a-popover>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import ControlTag from '../control-tag/ControlTag.vue';
import ExpressionDesignerCascader from '../../cascader/Cascader.vue';
import { createComponent, IVariableFormFieldProps } from './variableFormFieldBase';
import { Select as ASelect, Tooltip as ATooltip, Popover as APopover } from 'ant-design-vue';
import { OioInput, OioDatePicker, OioDateTimePicker, OioYearPicker, OioTimePicker } from '@oinone/kunlun-vue-ui-antd';

/**
 * 适用于非表单类变量控件
 */
export default defineComponent({
  components: {
    ATooltip,
    ASelect,
    APopover,
    OioInput,
    OioDatePicker,
    OioDateTimePicker,
    OioYearPicker,
    OioTimePicker,
    ExpressionDesignerCascader,
    ControlTag,
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    }
  },

  ...createComponent(),
  props: IVariableFormFieldProps,

  onCreated() {}
});
</script>
