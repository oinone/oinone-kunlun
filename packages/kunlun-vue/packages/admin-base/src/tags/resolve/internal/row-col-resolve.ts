import { ViewType } from '@kunlun/meta';
import { getCurrentThemeSize, ColSpanEnum } from '@kunlun/engine';
import { DslDefinition } from '@kunlun/dsl';
import { CSSStyle, CastHelper, BooleanHelper, NumberHelper, Optional } from '@kunlun/shared';
import {
  DEFAULT_CARD_GUTTERS,
  DEFAULT_GUTTERS,
  DEFAULT_VERTICAL_GUTTERS,
  LayoutHelper,
  StandardGutterType,
  DEFAULT_COLS,
  FlexColMode,
  FlexDirection,
  FlexRowAlign,
  InputMediaMode
} from '@kunlun/vue-ui-common';
import { StyleHelper } from '@kunlun/vue-ui-antd';
import { PropType, createVNode, defineComponent } from 'vue';
import { isEmpty, isNil, isString } from 'lodash-es';
import { SEARCH_WIDGET } from '../../../typing';
import { FlexRowStyleValue, FlexColStyleValue, InternalWidget } from '../typing';

const FlexRowAlignValue: Record<FlexRowAlign, string> = {
  [FlexRowAlign.TOP]: 'flex-start',
  [FlexRowAlign.MIDDLE]: 'center',
  [FlexRowAlign.BOTTOM]: 'flex-end'
};

export interface rowProps {
  align?: string;
  gutter: number[];
  justify?: string;
  flexLayout?: string;
  flexDirection?: string;
  wrap?: boolean;
  cols: number;
  style?: CSSStyle;
}

export interface colProps {
  offset: number;
  span: number;
  mode?: FlexColMode;
  width: string;
  minWidth: string;
  maxWidth: string;
  style?: CSSStyle;
}

export const ColStyleComponent = defineComponent({
  name: 'ColStyle',
  props: {
    colStyle: Object as PropType<CSSStyle>
  },
  render() {
    const { colStyle } = this;
    return createVNode('div', { style: colStyle }, { default: () => this.$slots });
  }
});

export class RowHelper {
  private customDefaultGutter: StandardGutterType | undefined = undefined;
  private isCard: boolean | undefined;
  private defaultWidget: string[] = ['search', SEARCH_WIDGET];
  private rowProps: rowProps;
  private widget: string;

  constructor(rowDsl: DslDefinition, parentCols?: number) {
    this.widget = rowDsl.widget;
    this.rowProps = {
      align: this.getAlign(rowDsl),
      gutter: this.getGutter(rowDsl),
      justify: this.getJustify(rowDsl),
      flexLayout: this.getFlexLayout(rowDsl),
      flexDirection: this.getFlexDirection(rowDsl),
      wrap: this.getWrap(rowDsl),
      cols: this.getCols(rowDsl, parentCols),
      style: this.getStyle(rowDsl)
    };
  }

  // fixme 把style枚举完，转成class
  public fetchRowStyle(): CSSStyle {
    const { style } = this.getRowProps();
    const computeStyle = this.computeStyle();
    const oldStyle: CSSStyle = CastHelper.cast(style || {});
    return {
      ...computeStyle,
      ...oldStyle
    } as unknown as CSSStyle;
  }

  private computeStyle(): CSSStyle {
    const { gutter, wrap, align, justify } = this.getRowProps();
    const styledGap = Array.isArray(gutter) ? gutter.map((g) => `${g}px`).join(' ') : `${gutter}px`;
    return {
      display: FlexRowStyleValue.Flex,
      'flex-wrap': wrap === false ? FlexRowStyleValue.Nowrap : FlexRowStyleValue.Wrap,
      'align-items': align,
      'justify-content': justify,
      gap: styledGap
      // zIndex: toString(props.level * 10 - 2)
    } as unknown as CSSStyle;
  }

  public getRowProps(): rowProps {
    return this.rowProps;
  }

  private getDefaultGutters() {
    const size = getCurrentThemeSize();

    switch (size) {
      case 'large':
        return DEFAULT_GUTTERS;
      case 'medium':
        return DEFAULT_VERTICAL_GUTTERS;
      default:
        return DEFAULT_CARD_GUTTERS;
    }
  }

  private defaultGutter(): StandardGutterType {
    if (this.customDefaultGutter) {
      return this.customDefaultGutter;
    }
    if (this.isCard) {
      return DEFAULT_CARD_GUTTERS;
    }
    return this.getDefaultGutters();
  }

  private getAlign(rowDsl: DslDefinition): string {
    return FlexRowAlignValue[rowDsl.align?.toLowerCase()];
  }

  private getGutter(rowDsl: DslDefinition): number[] {
    const { gutter } = rowDsl;
    if (!isEmpty(gutter)) {
      if (isString(gutter)) {
        return LayoutHelper.convertGutter(gutter, this.defaultGutter());
      }
      return gutter;
    }
    return this.defaultGutter();
  }

  private getJustify(rowDsl: DslDefinition): string {
    return rowDsl.justify?.toLowerCase();
  }

  private getFlexLayout(rowDsl: DslDefinition): string {
    return rowDsl.flexLayout?.toLowerCase();
  }

  private getFlexDirection(rowDsl: DslDefinition): string {
    return rowDsl.flexDirection?.toLowerCase();
  }

  private getWrap(rowDsl: DslDefinition): boolean | undefined {
    let { wrap } = rowDsl;
    if (isNil(wrap)) {
      wrap = true;
    }
    return BooleanHelper.toBoolean(wrap);
  }

  //parentCols 从调用的组件的cols拿到
  private getCols(rowDsl?: DslDefinition, parentCols?: number) {
    let cols = NumberHelper.toNumber(rowDsl?.cols) as number | undefined;
    const widget = rowDsl?.widget;
    if (!this.defaultWidget.includes(widget) && isNil(cols)) {
      cols = parentCols;
    }
    if (isNil(cols)) {
      cols = this.getDefaultCols(rowDsl);
    }
    return cols;
  }

  private getDefaultCols(rowDsl?: DslDefinition): number {
    const widget = rowDsl?.widget;
    if (widget) {
      switch (widget) {
        case 'search':
        case SEARCH_WIDGET:
          return 4;
        default:
          break;
      }
    }
    return 1;
  }

  private getStyle(rowDsl: DslDefinition) {
    return StyleHelper.parse(rowDsl.style);
  }
}

export class ColHelper {
  private rowHelper: RowHelper;
  private colProps: colProps;
  private viewType: ViewType | undefined;
  private widget: string;

  public constructor(rowHelper: RowHelper, colDsl: DslDefinition, viewType?: ViewType) {
    this.widget = colDsl.widget;
    this.viewType = viewType;
    this.rowHelper = rowHelper;
    this.colProps = {
      offset: this.getOffset(colDsl),
      span: this.getSpan(colDsl),
      mode: this.getMode(colDsl),
      width: this.getWidth(colDsl),
      minWidth: this.getMinWidth(colDsl),
      maxWidth: this.getMaxWidth(colDsl),
      style: this.getStyle(colDsl)
    };
  }

  public fetchColStyle(): CSSStyle {
    // const classList:string[] = this.computeClass()
    const computeStyle = this.computeStyle();
    const { style } = this.getColProps();
    const oldStyle: CSSStyle = CastHelper.cast(style || {});
    return {
      ...computeStyle,
      ...(oldStyle || {})
    } as unknown as CSSStyle;
  }

  private computeStyle(): CSSStyle {
    const { flexDirection, gutter } = this.rowHelper.getRowProps();
    const { mode, span, width, minWidth, maxWidth, offset } = this.getColProps();
    const style = {} as CSSStyle;

    if (this.widget === InternalWidget.Container) {
      style.flex = this.calculateContainerFlex(span, gutter, mode);
    } else {
      if ((mode && [FlexColMode.FULL, FlexColMode.AUTO].includes(mode)) || flexDirection === FlexDirection.Column) {
        if (mode === FlexColMode.FULL) {
          style.flex = FlexColStyleValue.Full;
        } else if (flexDirection === FlexDirection.Column) {
          style.flex = FlexColStyleValue.Auto;
        }
      }
      // 不存在mode或FlexColMode===Manual && flexDirection === FlexDirection.Row
      else {
        style.flex = this.calculateFlex(span, gutter);
      }
    }

    if (offset) {
      style.marginLeft = this.calculateMarginLeft(gutter, offset);
    }
    if (width || minWidth || maxWidth) {
      if (width) {
        // style.minWidth = width;
        // style.maxWidth = width;
        style.flex = `0 0 ${width}px`;
      }
      if (minWidth) {
        style.minWidth = minWidth;
      }
      if (maxWidth) {
        style.maxWidth = maxWidth;
      }
    }
    return style;
  }

  /**
   * 根据span和gutter计算flex样式
   * @returns
   */
  public calculateFlex(span, gutter: number[]): string {
    const finalGutter = this.calculateFinalGutter(gutter);
    return `0 0 calc(${(Number(span) / 24) * 100}% + ${(Number(span) / 24) * finalGutter - finalGutter}px)`;
  }

  public calculateContainerFlex(span, gutter: number[], mode?: FlexColMode): string {
    if (!mode) return FlexColStyleValue.Full;
    const finalGutter = this.calculateFinalGutter(gutter);
    return `0 0 calc(${(Number(span) / 24) * 100}% + ${(Number(span) / 24) * finalGutter - finalGutter}px)`;
  }

  public calculateMarginLeft(gutter, offset: number): string {
    const finalGutter = this.calculateFinalGutter(gutter);
    return `calc(${(offset / 24) * 100}% + ${(offset / 24) * finalGutter}px)`;
  }

  public calculateFinalGutter(gutter: number[]): number {
    let finalGutter;
    if (Array.isArray(gutter)) {
      // TODO get gutter from direction
      finalGutter = gutter[1] ?? gutter[0];
    }
    return finalGutter;
  }

  public getColProps() {
    return this.colProps;
  }

  private getOffset(colDsl: DslDefinition): number {
    const { cols } = this.rowHelper.getRowProps();
    let offset = NumberHelper.toNumber(colDsl.offset);
    if (!offset || offset <= 0) {
      offset = 0;
    }
    return (DEFAULT_COLS / cols) * offset;
  }

  private getSpan(colDsl: DslDefinition): number {
    const { cols } = this.rowHelper.getRowProps();
    let dslSpan: string | number | undefined = Optional.ofNullable(colDsl.colSpan).orElse(colDsl.span);
    if (isNil(dslSpan) && this.viewType === ViewType.Search) dslSpan = 'QUARTER';
    if (isString(dslSpan)) {
      const colSpan = ColSpanEnum[dslSpan.toUpperCase()];
      if (colSpan) {
        dslSpan = cols * colSpan;
      }
    }
    let span = NumberHelper.toNumber(dslSpan);
    if (isNil(span) || isNaN(span) || span <= 0) {
      span = cols;
    }
    if (span > cols) {
      span = cols;
    }
    return (DEFAULT_COLS / cols) * span;
  }

  // widthType
  private getMode(colDsl: DslDefinition) {
    let { mode } = colDsl;
    if (isNil(mode)) {
      mode = colDsl.widthType;
    }
    return mode?.toLowerCase?.();
  }

  private getWidth(colDsl: DslDefinition) {
    return colDsl.width;
  }

  private getMinWidth(colDsl: DslDefinition) {
    return colDsl.minWidth;
  }

  private getMaxWidth(colDsl: DslDefinition) {
    return colDsl.maxWidth;
  }

  private getStyle(colDsl: DslDefinition) {
    return StyleHelper.parse(colDsl.style);
  }
}
