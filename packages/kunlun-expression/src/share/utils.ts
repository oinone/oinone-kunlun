import { ModelFieldType } from '@kunlun/meta';
import scrollIntoViewUtil from 'dom-scroll-into-view/dist-src/util';
import { ExpModelConfig } from '../types';
import { translateValueByKey } from '@kunlun/engine';

/**
 * 根据父元素在页面的位置给子元素设置基于body节点的绝对定位css，使用场景：选择器(父)和下拉菜单(子)
 * @param parentElement
 * @param childElement
 * @param sameWidth 子元素和父元素同宽
 */
function autoSetPopoverCss(parentElement: HTMLElement, childElement: HTMLElement, childMatchParentWidth = false, zIndex = 99999) {
  if (!parentElement || !childElement) {
    return;
  }
  const offset = scrollIntoViewUtil.offset(parentElement);
  if (childElement) {
    // console.log('autoSetPopoverCss', parentElement, childElement)
    // 数值的会自动加px，所以需要先变成字符串
    scrollIntoViewUtil.css(childElement, 'zIndex', zIndex + '');
    scrollIntoViewUtil.css(childElement, 'position', 'absolute');
    scrollIntoViewUtil.css(childElement, 'left', offset.left + 'px');
    scrollIntoViewUtil.css(childElement, 'top', offset.top + parentElement.clientHeight + 'px');
    if (childMatchParentWidth) {
      scrollIntoViewUtil.css(childElement, 'width', parentElement.clientWidth + 'px');
    }
  }
}

function isSingleComplexField(tType: ModelFieldType) {
  return [ModelFieldType.OneToOne, ModelFieldType.ManyToOne].includes(tType);
}

function isModelOrField(model: string) {
  return isModelModel(model) || isModelField(model);
}

/**
 * 检查失焦
 * @param isFocus
 * @param targetElement 当前点击触发的元素
 * @param parentElement 父元素
 * @param dropdownElements 下拉元素
 * @param blurCallback
 * @param focusCallback
 */
function checkBlurFocus(
  isFocus: boolean,
  targetElement: HTMLElement,
  parentElement: HTMLElement,
  dropdownElements: HTMLElement | HTMLElement[],
  blurCallback: Function,
  focusCallback: Function
) {
  if (
    isFocus &&
    parentElement &&
    !parentElement.contains(targetElement) &&
    isDropdownBlur(targetElement, dropdownElements)
  ) {
    // console.log('blur', isFocus, targetElement, parentElement, dropdownElements);
    blurCallback && blurCallback();
  }
  if (
    !isFocus &&
    ((parentElement && parentElement.contains(targetElement)) || isDropdownFocus(targetElement, dropdownElements))
  ) {
    // console.log('focus', isFocus, targetElement, parentElement, dropdownElements);
    focusCallback && focusCallback();
  }
}

function isDropdownBlur(targetElement: HTMLElement, dropdownElements: HTMLElement | HTMLElement[]) {
  if (Array.isArray(dropdownElements)) {
    return dropdownElements.filter((a) => isDropdownFocus(targetElement, a)).length === 0;
  } else {
    return !isDropdownFocus(targetElement, dropdownElements);
  }
}

function isDropdownFocus(targetElement: HTMLElement, dropdownElements: HTMLElement | HTMLElement[]) {
  if (Array.isArray(dropdownElements)) {
    return dropdownElements.filter((a) => isDropdownFocus(targetElement, a)).length > 0;
  } else {
    return dropdownElements && dropdownElements.contains(targetElement);
  }
}

function isModelModel(model: string) {
  return [ExpModelConfig.BaseModel.toString(), ExpModelConfig.DesignerModelDefinition.toString()].includes(model!);
}
function isModelField(field: string) {
  return [ExpModelConfig.BaseField.toString(), ExpModelConfig.DesignerModelField.toString()].includes(field);
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function translateExpValue(key: string) {
  return translateValueByKey(key);
}

export {
  autoSetPopoverCss,
  isSingleComplexField,
  isModelOrField,
  checkBlurFocus,
  isModelModel,
  isModelField,
  randomNum
};
