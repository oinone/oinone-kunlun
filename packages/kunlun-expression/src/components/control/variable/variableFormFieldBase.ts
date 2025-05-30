/**
 * VariableInputFormField.vue
 * VariableTagFormField.vue
 */
import { Pagination } from '@kunlun/engine';
import { IModelField, isDateTtype, isNumberTtype, ModelFieldType } from '@kunlun/meta';
import { BooleanHelper, OioNotification } from '@kunlun/vue-ui-antd';
import { isNil } from 'lodash-es';
import {
  computed,
  ExtractPropTypes,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  SetupContext,
  watch
} from 'vue';
import {
  checkBlurFocus,
  createDefaultExpressionItem,
  createDefaultVariableItemList,
  createExpressionDisplayName,
  createInputPatternByTtype,
  createValueVariableListStr,
  createVariableContextItem,
  createVariableItemBySelectedOptions,
  getSelectedFields,
  isCustomInputWidget,
  isDefaultBlankStringVariableItemList,
  removeVariableItemByIndex,
  translateExpValue
} from '../../../share';
import {
  ElementSize,
  ExpressionDefinitionType,
  ExpressionSeniorMode,
  IExpressionItem,
  IExpressionOption,
  IExpressionQuoteType,
  IExpSelectOption,
  IVariableContextItem,
  IVariableItem,
  VARIABLE_MAX_STRING_LENGTH,
  VariableItemType,
  VariableItemTypeDisplayName,
  VariableItemTypeList
} from '../../../types';

export const IVariableFormFieldProps = {
  type: String as PropType<ExpressionDefinitionType>,
  readonly: Boolean,
  disabled: Boolean,
  blur: Function,
  validator: Function,
  onChangeValueList: Function,
  value: String,
  valueList: Array as PropType<IVariableItem[]>,
  change: Function,
  placeholder: String,
  options: Array as PropType<IExpSelectOption[]>,
  pagination: Object as PropType<Pagination>,
  onPaginationChange: Function,
  fetchChildren: Function as PropType<(selectedOptions: IExpSelectOption[]) => void>,
  onKeywordChange: Function,
  // label展示的是api名还是展示名称
  labelViewType: String as PropType<ExpressionSeniorMode>,
  contextItems: Array as PropType<IVariableContextItem[]>,
  // 高级模式可以先选模型再选字段，简单模式当前已经指定了模型
  isSimpleMode: Boolean,
  // 是否是直接选字段模式
  isFieldMode: Boolean,
  useContextName: Boolean,
  // 是否可输入字符串连接
  isAllowString: {
    type: Boolean,
    default: true
  },
  quoteType: {
    type: String as PropType<IExpressionQuoteType>
  },
  // 是否显示清空按钮
  allowClear: {
    type: Boolean,
    default: true
  },
  // 最少可选的变量数,0为不限制
  minVariableNum: {
    type: Number,
    default: 0
  },
  // 最多可选的变量数,0为不限制
  maxVariableNum: {
    type: Number,
    default: 3
  },
  // 是否可以直接选中多对一字段
  canSelectedComplexField: {
    type: Boolean,
    default: false
  },
  variableMaxStringLength: {
    type: Number,
    default: VARIABLE_MAX_STRING_LENGTH
  },
  // 是否显示VariableItemType的选择器
  showTypeSelect: {
    type: Boolean,
    default: false
  },
  // showType是否显示变量类型
  showVariableType: {
    type: Boolean,
    default: true
  },
  ttypes: Array as PropType<ModelFieldType[]>,
  // 左边需要连接方的ttype类型，决定了variableItemTypeList中的可选项
  leftJoinTtype: {
    type: String as PropType<ModelFieldType>
  },
  leftJoinField: {
    type: Object as PropType<IModelField>
  },
  // 同模型下的字段是否可以重复选择
  duplicateSelectField: Boolean,
  isVariableWidget: Boolean,
  getPopupContainer: Function,
  size: {
    type: String as PropType<ElementSize>,
    default: ElementSize.MIDDLE
  },
  expType: {
    type: String as PropType<ExpressionDefinitionType>
  },
  // 当此项为 true 时，点选每级菜单选项值都会发生变化
  changeOnSelect: {
    type: Boolean,
    default: false
  }
};

export function createEmits() {
  return ['update:value', 'update:valueList', 'change', 'changeList', 'blur', 'changeVariableType'];
}

export function createSetup(props: Readonly<ExtractPropTypes<typeof IVariableFormFieldProps>>, context: SetupContext) {
  const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);
  const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

  const variableType = ref<VariableItemType>(
    props.showVariableType ? VariableItemType.VARIABLE : VariableItemType.FIELD
  );
  const leftJoinTtype = computed((): ModelFieldType | undefined => {
    return props.leftJoinField?.ttype || props.leftJoinTtype;
  });

  watch(
    () => props.showVariableType,
    () => {
      if (!props.showVariableType) {
        variableType.value = VariableItemType.FIELD;
      }
    },
    { immediate: true }
  );
  const isShowDropdown = ref(false);
  const _variableItemList = ref<IVariableItem[]>(createDefaultVariableItemList());
  const variableItemList = computed<IVariableItem[]>({
    get() {
      return _variableItemList.value;
    },
    set(val) {
      const originIsDefault = isDefaultBlankStringVariableItemList(_variableItemList.value);
      if (originIsDefault) {
        if (!isDefaultBlankStringVariableItemList(val)) {
          _variableItemList.value = val;
        }
      } else {
        _variableItemList.value = val;
      }
    }
  });
  const stringValue = ref('');
  const searchKeywords = ref('');
  const searchInputMirrorRef = ref<HTMLElement>(null as any);
  const variableItemListRef = ref<HTMLElement>(null as any);
  const searchInputRef = ref(null);
  // const finalVariableType = ref<VariableItemType>(VariableItemType.VARIABLE);
  // const variableType = computed(() => {
  //   return finalVariableType.value;
  // });

  const innerPlaceholder = computed(() => {
    if (variableType.value) {
      const variableItemTypeDisplayName = VariableItemTypeDisplayName[variableType.value.toString().toUpperCase()];
      if (variableItemTypeDisplayName) {
        const opt = variableType.value === VariableItemType.STRING ? '输入' : '选择';
        return translateExpValue(`请${opt}${variableItemTypeDisplayName}`);
      }
    }
    return props.placeholder;
  });

  const variableItemTypeList = computed(() => {
    let list;
    if (!leftJoinTtype.value) {
      list = VariableItemTypeList.filter(
        (a) => ![VariableItemType.STRING, VariableItemType.OPTION].includes(a.value! as VariableItemType)
      );
    } else if (isCustomInputWidget(leftJoinTtype.value!) || isDateTtype(leftJoinTtype.value!)) {
      list = VariableItemTypeList.filter((a) => a.value !== VariableItemType.OPTION);
    } else {
      list = VariableItemTypeList.filter((a) => a.value !== VariableItemType.STRING);
    }
    if (props.expType !== ExpressionDefinitionType.RSQL_CONDITION) {
      list = list.filter(
        (a) => ![VariableItemType.FIELD, VariableItemType.SESSION].includes(a.value! as VariableItemType)
      );
    } else if (
      ![
        ModelFieldType.ID,
        ModelFieldType.UID,
        ModelFieldType.Integer,
        ModelFieldType.Long,
        ModelFieldType.String
      ].includes(leftJoinTtype.value!)
    ) {
      list = list.filter((a) => a.value !== VariableItemType.SESSION);
    }
    if (!props.showVariableType) {
      list = list.filter((a) => a.value !== VariableItemType.VARIABLE);
    }
    const vt = list.find((_a) => _a.value == variableType.value);
    if (!vt && list.length) {
      variableType.value = list[0].value as VariableItemType;
      context.emit('changeVariableType', variableType.value);
    }
    return list;
  });
  const isVariableMode = computed(() => {
    // 运算表达式的枚举和布尔特殊处理
    return (
      (props.showTypeSelect &&
        [VariableItemType.VARIABLE, VariableItemType.OPTION, VariableItemType.FIELD, VariableItemType.SESSION].includes(
          variableType.value!
        )) ||
      isExpressionOptionMode()
    );
  });

  function isExpressionOptionMode() {
    return (
      props.expType === ExpressionDefinitionType.OPERATION &&
      leftJoinTtype.value &&
      [ModelFieldType.Enum, ModelFieldType.Boolean].includes(leftJoinTtype.value!)
    );
  }

  const isStringMode = computed(() => {
    return props.showTypeSelect && variableType.value === VariableItemType.STRING;
  });
  const allowString = computed(() => {
    return isVariableMode.value ? false : props.isAllowString;
  });
  watch(
    () => props.leftJoinTtype,
    () => {
      // variableType.value = isCustomInputWidget(props.leftJoinTtype) ? VariableItemType.STRING : VariableItemType.VARIABLE;
    },
    { immediate: true }
  );

  // 字段搜索的关键字
  const fieldKeywords = ref('');
  const availableOptions = computed(() => {
    const selectedFields = props.duplicateSelectField ? [] : getSelectedFields(variableItemList.value);
    const options = (props.options || []).filter((a) => !selectedFields.includes(a.name!));
    options.forEach((a) => {
      a.selected = false;
    });
    return fieldKeywords.value ? options.filter((a) => a.displayName!.includes(fieldKeywords.value)) : options;
  });
  const variableItemNum = computed<number>(() => {
    return variableItemList.value.filter((a) => a.type === VariableItemType.VARIABLE).length;
  });
  const isValueEmpty = computed(() => {
    return (!variableItemList.value || variableItemList.value.length === 0) && !stringValue.value;
  });
  const isShowClear = computed(() => {
    if (props.showTypeSelect && variableType.value === VariableItemType.VARIABLE) {
      return false;
    }
    return props.allowClear && !(isOnlyOneInput.value && variableItemList.value[0].value === '') && !readonly.value;
  });
  const isOnlyOneInput = computed(() => {
    return computedIsOnlyOneInput();
  });
  const computedIsOnlyOneInput = () => {
    return (
      variableItemList.value &&
      variableItemList.value.length === 1 &&
      variableItemList.value[0].type === VariableItemType.STRING
    );
  };
  const variablesDisplayName = computed(() => {
    const name = createExpressionDisplayName(
      [{ ...createDefaultExpressionItem(props.type!), valueList: variableItemList.value }] as IExpressionItem[],
      { variableContextItems: props.contextItems!, type: ExpressionDefinitionType.OPERATION } as IExpressionOption
    );
    return name.replace('(', '').replace(')', '');
  });
  const onSearchKeywordsChange = (e) => {
    props.onKeywordChange?.(searchKeywords.value);
  };
  const onSearchFieldKeywordsChange = (e) => {};
  const onCloseTagItem = (index) => {
    // 如果不加延时，则选中的元素会从dom节点下移除，在onContains方法内会被判断为失焦
    let t = setTimeout(async () => {
      removeVariableItemByIndex(variableItemList.value, index, props.variableMaxStringLength);
      await nextTick();
      props.blur && props.blur();
      clearTimeout(t);
      t = null as any;
    }, 300);
  };

  const inputSelectionInfo = { index: null, selectionStart: null };

  const onSelectVariableInner = (selectedValues: string[]) => {
    if (!isVariableMode.value && variableItemNum.value >= props.maxVariableNum) {
      OioNotification.error(
        translateExpValue('错误'),
        `${translateExpValue('最多只能选')}${props.maxVariableNum}${translateExpValue('个变量')}`
      );
      return;
    }

    const variableItem = createVariableItemBySelectedOptions(
      props.options!,
      selectedValues,
      createVariableContextItem(selectedValues, props.contextItems!),
      variableType.value,
      props.ttypes,
      props.useContextName
    );
    if (!variableItem) {
      return;
    }
    if (isVariableMode.value) {
      variableItemList.value = [variableItem];
    } else {
      if (variableItemList.value.length > 0) {
        const lastValue = variableItemList.value[variableItemList.value.length - 1];
        // 如果最后一个是空字符串则在新增变量后删除上一个空字符串
        if (lastValue && lastValue.type === VariableItemType.STRING && lastValue.value === '') {
          // variableItemList.value.pop();
        }
      }
      if (inputSelectionInfo && !isNil(inputSelectionInfo.index)) {
        const varItem = variableItemList.value[inputSelectionInfo.index];
        const allText = varItem.value;
        varItem.value = allText.substring(0, inputSelectionInfo.selectionStart!);
        const nextStr = allText.substring(inputSelectionInfo.selectionStart!);
        variableItemList.value.splice(inputSelectionInfo.index + 1, 0, variableItem, {
          type: VariableItemType.STRING,
          value: nextStr
        } as IVariableItem);
      } else {
        variableItemList.value.push(variableItem, { type: VariableItemType.STRING, value: '' } as IVariableItem);
      }
    }
    isShowDropdown.value = false;

    props.blur && props.blur();
  };
  const onSelectVariable = (selectedValues: string[]) => {
    // 如果不加延时，则选中的元素会从dropdown的dom节点下移除，在onContains方法内会被判断为失焦
    setTimeout(() => {
      onSelectVariableInner(selectedValues);
    }, 300);
  };
  watch(
    variableItemList,
    (newVariableItemList) => {
      const valueStr = createValueVariableListStr(newVariableItemList, {
        variableContextItems: props.contextItems,
        quoteType: props.quoteType
      } as IExpressionOption);
      // console.log('variableItemList', newVariableItemList, valueStr);
      context.emit('update:value', valueStr);
      context.emit('change', valueStr);
      context.emit('update:valueList', newVariableItemList);
      context.emit('changeList', newVariableItemList);
      // props.change?.(valueStr);
      props.onChangeValueList?.(newVariableItemList);
      nextTick(() => {
        autoSetStyle();
      });
    },
    {
      deep: true
    }
  );
  const autoSetStyle = () => {
    let offsetWidth = 10;
    // console.log('auto', variableItemListRef.value, variableItemList.value.length);
    if (
      variableItemListRef.value &&
      variableItemListRef.value.children &&
      variableItemListRef.value.children.length > 0
    ) {
      offsetWidth = 20;
      Array.from(variableItemListRef.value.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          offsetWidth += (child as HTMLElement).offsetWidth;
        }
      });
    }
    if (variableItemList.value) {
      variableItemList.value.forEach((a, index) => {
        computeInputWidth(index);
      });
    }
  };

  function getPopupContainerInner() {
    return props.getPopupContainer?.(variableFieldRef.value) || document.body;
  }

  const dropdownPopupContainer = computed(() => {
    return getPopupContainerInner();
  });

  watch(searchKeywords, (newVal) => {
    if (searchKeywords.value) {
      props.onKeywordChange?.(searchKeywords.value);
    }
  });

  watch(
    () => props.value,
    (newVal) => {
      // console.log('newVal', newVal);
      // variableItemList.value = convertorValue2ValueList();
    },
    { immediate: true }
  );

  let isInit = false;
  watch(
    () => props.valueList,
    (newVal) => {
      // console.log('valueList', newVal);
      variableItemList.value = props.valueList || [];
      if (props.showTypeSelect) {
        if (!isInit || 1 > 0) {
          const varItem = variableItemList.value.find((a) => a.type === VariableItemType.VARIABLE);
          if (varItem) {
            variableType.value = VariableItemType.VARIABLE;
          } else {
            const fieldItem = variableItemList.value.find((a) => a.type === VariableItemType.FIELD);
            if (fieldItem) {
              variableType.value = VariableItemType.FIELD;
            } else {
              const fieldItem = variableItemList.value.find((a) => a.type === VariableItemType.SESSION);
              if (fieldItem) {
                variableType.value = VariableItemType.SESSION;
              } else {
                if ([ModelFieldType.Enum, ModelFieldType.Boolean].includes(leftJoinTtype.value!)) {
                  variableType.value = VariableItemType.OPTION;
                } else {
                  variableType.value = VariableItemType.STRING;
                }
              }
            }
          }
          isInit = true;
        }
      }
      nextTick(() => {
        autoSetStyle();
      });
    },
    { immediate: true, deep: true }
  );

  watch(
    () => readonly.value,
    (newVal) => {
      if (!newVal) {
        nextTick(() => {
          autoSetStyle();
        });
      }
    },
    { immediate: true }
  );

  const variableFieldRef = ref<HTMLElement>(null as any);
  const dropdownRef = ref<HTMLElement>(null as any);

  watch(isShowDropdown, () => {
    if (isShowDropdown.value) {
      fieldKeywords.value = '';
      nextTick(() => {
        // autoSetPopoverCss(variableFieldRef.value, dropdownRef.value, props.isFieldMode);
      });
    } else {
      // props.blur?.();
    }
  });

  const onAddVariableItem = (source: 'input' | 'suffix') => {
    if (isExpressionOptionMode()) {
      if (source === 'input') {
        // 输入框区域点击添加
        variableType.value = VariableItemType.OPTION;
      } else if (source === 'suffix') {
        // 输入框后缀区域点击添加
        variableType.value = VariableItemType.VARIABLE;
      }
    }
    context.emit('changeVariableType', variableType.value);
    if (isShowDropdown.value) {
      isShowDropdown.value = false;
    } else {
      // 只能选一个的情况下，如当前已选中一个，允许下拉选第二个，第二个选中后替换掉第一个
      if (variableItemNum.value >= props.maxVariableNum && !(props.minVariableNum == 1 && props.maxVariableNum == 1)) {
        return;
      }
      isShowDropdown.value = true;
      if (computedIsOnlyOneInput()) {
        computeInputWidth(0);
      }
      // if (stringValue.value) {
      //   variableItemList.value.push({ value: stringValue.value, type: VariableItemType.STRING } as IVariableItem);
      //   stringValue.value = '';
      // }
    }
  };

  function clearAll() {
    variableItemList.value = createDefaultVariableItemList();
    props.blur?.();
  }

  const onClear = () => {
    // 如果不加延时，则选中的元素会从dom节点下移除，在onContains方法内会被判断为失焦
    if (isShowDropdown.value) {
      setTimeout(() => {
        clearAll();
      }, 200);
    } else {
      clearAll();
    }
  };

  const variableItemInputRefs = {};
  const setVariableItemInputRef = (el: any, index: number) => {
    if (el) {
      variableItemInputRefs[index] = el;
    }
  };

  const variableItemInputMirrorRefs = {};
  const setVariableItemInputMirrorRef = (el: any, index: number) => {
    if (el) {
      variableItemInputMirrorRefs[index] = el;
    }
  };
  const onBlurVariableItemString = (index) => {
    // inputSelectionInfo.index = null;
    // inputSelectionInfo.selectionStart = null;
  };
  const onFocusVariableItemString = (index, e) => {
    const ele = variableItemInputRefs[index];
    setTimeout(() => {
      inputSelectionInfo.index = index;
      inputSelectionInfo.selectionStart = ele.selectionStart;
    }, 200);
  };
  const onChangeVariableItemString = (index) => {
    const variableItem = variableItemList.value[index];
    if (isNumberTtype(leftJoinTtype.value!)) {
      const pattern = createInputPatternByTtype(leftJoinTtype.value!);
      const arr = variableItem.value.match(new RegExp(pattern, 'g'));
      const newStr = arr ? arr.join('') : '';
      if (newStr != variableItem.value) {
        variableItem.value = newStr;
      }
    }
    if (variableItem.value.length > props.variableMaxStringLength) {
      variableItemList.value[index].value = variableItem.value.substring(0, props.variableMaxStringLength);
    }
    if (computedIsOnlyOneInput()) {
      return;
    }
    nextTick(() => {
      computeInputWidth(index);
    });
  };
  const computeInputWidth = (index: number) => {
    const isLast = index === variableItemList.value.length - 1;
    const variableItemInputRef = variableItemInputRefs[index];
    const variableItemInputMirrorRef = variableItemInputMirrorRefs[index];
    if (variableItemInputRef) {
      let width = variableItemInputMirrorRef.offsetWidth + 5;
      if (isLast) {
        // 最后一个字符串输入框再行内宽度足够的时候补全剩余宽度
        let itemWidth = 0;
        const marginRight = 5;
        variableItemListRef.value.querySelectorAll('.variable-item').forEach((el) => {
          if (!el.className.includes(`variable-item-${index}`)) {
            itemWidth += el.clientWidth + marginRight;
          }
        });
        const minWidth = variableItemListRef.value.offsetWidth - itemWidth;
        width = minWidth > 0 ? minWidth : width;
      }
      variableItemInputRef.style.cssText = `width: ${width}px;`;
    }
  };

  let isFocus = false;
  const onContains = (e) => {
    checkBlurFocus(
      isFocus,
      e.target as HTMLElement,
      variableFieldRef.value,
      dropdownRef.value,
      () => {
        isFocus = false;
        isShowDropdown.value = false;
        props.blur?.();
        context.emit('blur');
      },
      () => {
        isFocus = true;
      }
    );
  };

  const onChangeVariableType = (val) => {
    onClear();
    context.emit('changeVariableType', val);
  };

  // 获得焦点的节点
  const focusNodes = computed<HTMLElement[]>(() => {
    return [variableFieldRef.value, dropdownRef.value] as HTMLElement[];
  });

  onMounted(() => {
    document.body.addEventListener('click', onContains);
    // variableItemList.value = createDefaultVariableItemList();
  });
  onBeforeUnmount(() => {
    document.body.removeEventListener('click', onContains);
    isShowDropdown.value = false;
  });

  const isRealNumberTtype = (ttype: ModelFieldType): boolean => {
    return [ModelFieldType.Float, ModelFieldType.Currency].includes(ttype);
  };
  return {
    disabled,
    readonly,
    focusNodes,
    dropdownPopupContainer,
    variableItemInputRefs,
    setVariableItemInputRef,
    variableItemInputMirrorRefs,
    setVariableItemInputMirrorRef,
    onChangeVariableItemString,
    onFocusVariableItemString,
    onBlurVariableItemString,
    onChangeVariableType,
    variablesDisplayName,
    variableType,
    isShowDropdown,
    variableItemList,
    stringValue,
    searchKeywords,
    isOnlyOneInput,
    searchInputMirrorRef,
    variableItemListRef,
    searchInputRef,
    isValueEmpty,
    isShowClear,
    variableFieldRef,
    dropdownRef,
    fieldKeywords,
    availableOptions,
    variableItemNum,
    isVariableMode,
    isStringMode,
    onSelectVariable,
    onSearchKeywordsChange,
    onSearchFieldKeywordsChange,
    onCloseTagItem,
    onAddVariableItem,
    onClear,
    innerPlaceholder,
    variableItemTypeList,
    allowString,
    isNumberTtype,
    isRealNumberTtype,
    createInputPatternByTtype,
    isDateTtype,
    translateExpValue
  };
}

export function createComponent() {
  return {
    emits: createEmits(),
    setup(props, context) {
      return createSetup(props, context);
    },
    onCreated() {}
  };
}
