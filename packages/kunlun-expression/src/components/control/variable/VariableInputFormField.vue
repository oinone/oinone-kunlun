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
        class="ant-input-group-wrapper variable-input-form-field"
        :class="{
          'variable-input-form-field-readonly': readonly,
          'variable-input-form-field-string': isStringMode,
          'variable-input-form-field-variable': isVariableMode
        }"
      >
        <span class="ant-input-wrapper ant-input-group">
          <span class="ant-input-group-addon variable-type-addon" v-if="showTypeSelect">
            <a-select
              dropdown-class-name="oio-expression-select-dropdown-global"
              v-model:value="variableType"
              size="small"
              :dropdown-match-select-width="false"
              :get-popup-container="(triggerNode) => triggerNode.parentNode"
              @change="onChangeVariableType"
              @click="
                () => {
                  isShowDropdown = false;
                }
              "
            >
              <a-select-option v-for="opt in variableItemTypeList" :value="opt.value">{{
                translateExpValue(opt.label)
              }}</a-select-option>
            </a-select>
          </span>

          <div
            v-if="readonly && isVariableWidget && !variableItemNum && !valueList[0].value"
            class="ant-input-affix-wrapper"
          >
            <span class="ant-input">
              <div class="oio-empty">-</div>
            </span>
          </div>
          <div v-else class="ant-input-affix-wrapper">
            <span class="ant-input" ref="variableItemListRef" :class="{ 'only-one-input': isOnlyOneInput }">
              <div class="ant-input-inner" @click="(e) => isVariableMode && onAddVariableItem('input')">
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
                    <template v-if="readonly">{{ variableItem.value }}</template>
                    <template v-else>
                      <template v-if="!isDateTtype(leftJoinTtype)">
                        <input
                          v-model="variableItem.value"
                          type="text"
                          :pattern="createInputPatternByTtype(leftJoinTtype)"
                          :maxlength="variableMaxStringLength"
                          :placeholder="showTypeSelect ? innerPlaceholder : isOnlyOneInput ? innerPlaceholder : ''"
                          :ref="(el) => setVariableItemInputRef(el, index)"
                          class="variable-item-input ant-input"
                          @change="onChangeVariableItemString(index)"
                          @keydown="(e) => onFocusVariableItemString(index, e)"
                          @click="(e) => onFocusVariableItemString(index, e)"
                          @focus="(e) => onFocusVariableItemString(index, e)"
                          @blur="onBlurVariableItemString(index)"
                        />
                        <span
                          class="variable-item-input-mirror"
                          :ref="(el) => setVariableItemInputMirrorRef(el, index)"
                        >
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
                    </template>
                  </span>
                  <control-tag
                    v-if="['variable', 'option', 'field', 'session'].includes(variableItem.type)"
                    class="variable-item variable-tag"
                    :class="`variable-item-${index}`"
                    :title="variableItem.displayName"
                    :desc="variableItem.subTitle"
                    :closable="!readonly && !showTypeSelect"
                    @close="onCloseTagItem(index)"
                  />
                </template>
              </div>
            </span>
            <span class="ant-input-suffix" v-if="isShowClear && variableType === 'string'" @click="onClear">
              <close-circle-filled class="ant-input-clear-icon" />
            </span>
          </div>

          <template v-if="!showTypeSelect">
            <a-tooltip
              :title="`${translateExpValue('最多只能选')}${maxVariableNum}${translateExpValue('个字段')}`"
              v-if="!readonly && variableItemNum >= maxVariableNum"
            >
              <span class="ant-input-group-addon">
                <i class="d-iconfont" :class="[isFieldMode ? 'oinone-data-label' : 'oinone-variable-x']" />
              </span>
            </a-tooltip>
            <span class="ant-input-group-addon" v-else-if="!readonly" @click="onAddVariableItem('suffix')">
              <i class="d-iconfont" :class="[isFieldMode ? 'oinone-data-label' : 'oinone-variable-x']" />
            </span>
          </template>
        </span>
      </span>
    </template>

    <template #content>
      <div ref="dropdownRef">
        <expression-designer-cascader
          :canSelectedComplexField="canSelectedComplexField"
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
import { CloseCircleFilled } from '@ant-design/icons-vue';
import { Select as ASelect, Tooltip as ATooltip, Popover as APopover } from 'ant-design-vue';
import { OioInput, OioDatePicker, OioDateTimePicker, OioYearPicker, OioTimePicker } from '@kunlun/vue-ui-antd';
import ControlTag from '../control-tag/ControlTag.vue';
import ExpressionDesignerCascader from '../../cascader/Cascader.vue';
import { createComponent, IVariableFormFieldProps } from './variableFormFieldBase';

/**
 * 适用于表单类变量控件
 */
export default defineComponent({
  components: {
    CloseCircleFilled,
    OioInput,
    ASelect,
    ATooltip,
    APopover,
    OioDatePicker,
    OioDateTimePicker,
    OioYearPicker,
    OioTimePicker,
    ExpressionDesignerCascader,
    ControlTag
  },

  ...createComponent(),
  props: IVariableFormFieldProps,

  onCreated() {}
});
</script>
