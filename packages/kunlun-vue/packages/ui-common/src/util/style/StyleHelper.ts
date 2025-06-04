import {
  BooleanHelper,
  CSSStyle,
  DslBorderVisible,
  DslBorderVisibleType,
  DslDefinitionStyle,
  NumberHelper,
  ObjectUtils,
  Optional,
  StandardNumber,
  StringHelper
} from '@oinone/kunlun-shared';
import { parseStringStyle } from '@vue/shared';
import { isArray, isBoolean, isNil, isObject, isString, toString } from 'lodash-es';
import { DEFAULT_DSL_STYLE_VALUE } from './DslStyleConstant';

/**
 * CSS样式帮助类
 */
export class StyleHelper {
  /**
   * style解析
   * @param style
   */
  public static parse(style: string | CSSStyle | undefined): CSSStyle | undefined {
    if (isNil(style)) {
      return undefined;
    }
    let result: CSSStyle | undefined;
    if (isObject(style)) {
      result = style;
    } else if (isString(style)) {
      result = parseStringStyle(style) as CSSStyle;
    } else {
      console.warn('Invalid style parameter type.', style);
    }
    return result;
  }

  /**
   * 格式化px单位
   * @param val
   */
  public static px(val: StandardNumber): string | undefined {
    if (ObjectUtils.isEmpty(val)) {
      return undefined;
    }
    const num = NumberHelper.toNumber(val);
    if (isNil(num)) {
      return toString(val);
    }
    return `${num}px`;
  }

  public static convertStyleByDslDefinition(
    dsl: DslDefinitionStyle | Record<string, unknown> | undefined
  ): CSSStyle | undefined {
    if (!dsl) {
      return undefined;
    }
    const dslStyle = dsl as DslDefinitionStyle;
    const style = StyleHelper.parse(dslStyle.style) || ({} as CSSStyle);
    StyleHelper.convertStyleByDslDefinitionForAppearance(style, dslStyle);
    StyleHelper.convertStyleByDslDefinitionForLayout(style, dslStyle);
    StyleHelper.convertStyleByDslDefinitionForBorder(style, dslStyle);
    if (!Object.keys(style).length) {
      return undefined;
    }
    return style;
  }

  private static convertStyleByDslDefinitionForAppearance(style: CSSStyle, dslStyle: DslDefinitionStyle) {
    const { width, height } = dslStyle;
    StringHelper.setter(width, (v) => (style.width = v));
    StringHelper.setter(height, (v) => (style.height = v));
  }

  private static convertStyleByDslDefinitionForLayout(style: CSSStyle, dslStyle: DslDefinitionStyle) {
    const { textAlign, flex, flexDirection, flexWrap, justifyContent, alignItem, alignContent, overflow } = dslStyle;
    StringHelper.setter(textAlign, (v) => (style.textAlign = v));
    StringHelper.setter(flex, (v) => (style.flex = v));
    StringHelper.setter(flexDirection, (v) => (style.flexDirection = v));
    Optional.ofNullable(flexWrap)
      .map(BooleanHelper.toBoolean)
      .map((v) => {
        if (v) {
          style.flexWrap = 'wrap';
        } else {
          style.flexWrap = 'nowrap';
        }
        return v;
      })
      .orElseGet(() => {
        StringHelper.setter(flexWrap as string | undefined, (v) => (style.flexWrap = v));
        return undefined;
      });
    StringHelper.setter(justifyContent, (v) => (style.justifyContent = v));
    StringHelper.setter(alignItem, (v) => (style.alignItem = v));
    StringHelper.setter(alignContent, (v) => (style.alignContent = v));
    StringHelper.setter(overflow, (v) => (style.overflow = v));
  }

  private static convertStyleByDslDefinitionForBorder(style: CSSStyle, dslStyle: DslDefinitionStyle) {
    const {
      borderVisible,
      border,
      borderWidth,
      borderStyle,
      borderColor,
      borderTop,
      borderTopWidth,
      borderTopStyle,
      borderTopColor,
      borderRight,
      borderRightWidth,
      borderRightStyle,
      borderRightColor,
      borderBottom,
      borderBottomWidth,
      borderBottomStyle,
      borderBottomColor,
      borderLeft,
      borderLeftWidth,
      borderLeftStyle,
      borderLeftColor
    } = dslStyle;
    let finalBorderVisible: DslBorderVisible | undefined = borderVisible;
    if (isString(finalBorderVisible)) {
      finalBorderVisible = StringHelper.convertArray(finalBorderVisible) as DslBorderVisibleType[];
    }
    if (isBoolean(finalBorderVisible) && finalBorderVisible) {
      if (border) {
        style.border = border;
        StringHelper.setter(borderWidth, (v) => (style.borderWidth = v));
        StringHelper.setter(borderStyle, (v) => (style.borderStyle = v));
        StringHelper.setter(borderColor, (v) => (style.borderColor = v));
      } else {
        style.borderWidth = StringHelper.getOrDefault(borderWidth, DEFAULT_DSL_STYLE_VALUE.borderWidth);
        style.borderStyle = StringHelper.getOrDefault(borderStyle, DEFAULT_DSL_STYLE_VALUE.borderStyle);
        style.borderColor = StringHelper.getOrDefault(borderColor, DEFAULT_DSL_STYLE_VALUE.borderColor);
      }
    } else if (isArray(finalBorderVisible)) {
      for (let borderVisibleItem of finalBorderVisible) {
        borderVisibleItem = borderVisibleItem?.toLowerCase?.() as DslBorderVisibleType;
        if (!borderVisibleItem) {
          return;
        }
        switch (borderVisibleItem as DslBorderVisibleType) {
          case DslBorderVisibleType.top:
            if (borderTop) {
              style.borderTop = borderTop;
              StringHelper.setter(borderTopWidth || borderWidth, (v) => (style.borderTopWidth = v));
              StringHelper.setter(borderTopStyle || borderStyle, (v) => (style.borderTopStyle = v));
              StringHelper.setter(borderTopColor || borderColor, (v) => (style.borderTopColor = v));
            } else {
              style.borderTopWidth = StringHelper.getOrDefault(
                borderTopWidth || borderWidth,
                DEFAULT_DSL_STYLE_VALUE.borderWidth
              );
              style.borderTopStyle = StringHelper.getOrDefault(
                borderTopStyle || borderStyle,
                DEFAULT_DSL_STYLE_VALUE.borderStyle
              );
              style.borderTopColor = StringHelper.getOrDefault(
                borderTopColor || borderColor,
                DEFAULT_DSL_STYLE_VALUE.borderColor
              );
            }
            break;
          case DslBorderVisibleType.right:
            if (borderRight) {
              style.borderRight = borderRight;
              StringHelper.setter(borderRightWidth || borderWidth, (v) => (style.borderRightWidth = v));
              StringHelper.setter(borderRightStyle || borderStyle, (v) => (style.borderRightStyle = v));
              StringHelper.setter(borderRightColor || borderColor, (v) => (style.borderRightColor = v));
            } else {
              style.borderRightWidth = StringHelper.getOrDefault(
                borderRightWidth || borderWidth,
                DEFAULT_DSL_STYLE_VALUE.borderWidth
              );
              style.borderRightStyle = StringHelper.getOrDefault(
                borderRightStyle || borderStyle,
                DEFAULT_DSL_STYLE_VALUE.borderStyle
              );
              style.borderRightColor = StringHelper.getOrDefault(
                borderRightColor || borderColor,
                DEFAULT_DSL_STYLE_VALUE.borderColor
              );
            }
            break;
          case DslBorderVisibleType.bottom:
            if (borderBottom) {
              style.borderBottom = borderBottom;
              StringHelper.setter(borderBottomWidth || borderWidth, (v) => (style.borderBottomWidth = v));
              StringHelper.setter(borderBottomStyle || borderStyle, (v) => (style.borderBottomStyle = v));
              StringHelper.setter(borderBottomColor || borderColor, (v) => (style.borderBottomColor = v));
            } else {
              style.borderBottomWidth = StringHelper.getOrDefault(
                borderBottomWidth || borderWidth,
                DEFAULT_DSL_STYLE_VALUE.borderWidth
              );
              style.borderBottomStyle = StringHelper.getOrDefault(
                borderBottomStyle || borderStyle,
                DEFAULT_DSL_STYLE_VALUE.borderStyle
              );
              style.borderBottomColor = StringHelper.getOrDefault(
                borderBottomColor || borderColor,
                DEFAULT_DSL_STYLE_VALUE.borderColor
              );
            }
            break;
          case DslBorderVisibleType.left:
            if (borderLeft) {
              style.borderLeft = borderLeft;
              StringHelper.setter(borderLeftWidth || borderWidth, (v) => (style.borderLeftWidth = v));
              StringHelper.setter(borderLeftStyle || borderStyle, (v) => (style.borderLeftStyle = v));
              StringHelper.setter(borderLeftColor || borderColor, (v) => (style.borderLeftColor = v));
            } else {
              style.borderLeftWidth = StringHelper.getOrDefault(
                borderLeftWidth || borderWidth,
                DEFAULT_DSL_STYLE_VALUE.borderWidth
              );
              style.borderLeftStyle = StringHelper.getOrDefault(
                borderLeftStyle || borderStyle,
                DEFAULT_DSL_STYLE_VALUE.borderStyle
              );
              style.borderLeftColor = StringHelper.getOrDefault(
                borderLeftColor || borderColor,
                DEFAULT_DSL_STYLE_VALUE.borderColor
              );
            }
            break;
          default:
            break;
        }
      }
    }
  }
}
