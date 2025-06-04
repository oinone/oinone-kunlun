import { DEFAULT_SLOT_NAME, DslDefinition, DslSlotUtils } from '@oinone/kunlun-dsl';
import { Align, Layout, Overflow } from '@oinone/kunlun-engine';
import { useMatched } from '@oinone/kunlun-router';
import { Constructor, CSSStyle, StringHelper } from '@oinone/kunlun-shared';
import {
  SPIFactory,
  SPIOperator,
  SPIOptions,
  SPISelectorFactory,
  SPISingleSelector,
  SPITokenFactory
} from '@oinone/kunlun-spi';
import { StyleHelper } from '@oinone/kunlun-vue-ui-common';
import {
  DslRender,
  DslRenderWidget,
  DslRenderWidgetProps,
  InnerWidgetType,
  IViewFilterOptions,
  ViewWidget,
  Widget
} from '@oinone/kunlun-vue-widget';
import { Slots, VNode } from 'vue';
import { getMaskTagManagerInstance } from '../register';

/**
 * Mask组件注册可选项
 */
export interface BaseMaskOptions extends SPIOptions {
  /**
   * 指定XML标签
   */
  dslNodeType?: string;
  /**
   * 指定组件名称
   */
  widget?: string | string[];
}

export interface BaseMaskWidgetProps extends DslRenderWidgetProps {
  /**
   * 自动组件
   */
  automatic?: boolean;

  class?: string;
  style?: string;

  height?: string;
  width?: string;
  align?: Align;
  layout?: Layout;
  flexWrap?: string;
  flexDirection?: string;
  alignContent?: string;
  flex?: string;
  wrap?: boolean;
  overflow?: Overflow;
}

const MASK_WIDGET_STORAGE_KEY = Symbol('Mask');

ViewWidget.Token = (options) => {
  const { tagName } = options;
  if (tagName) {
    let tagNames: string[];
    if (Array.isArray(tagName)) {
      tagNames = tagName;
    } else {
      tagNames = [tagName];
    }
    for (const tag of tagNames) {
      const maskTagManager = getMaskTagManagerInstance();
      if (maskTagManager && !maskTagManager.isInternalWidget(tag)) {
        maskTagManager.register(tag);
      }
    }
  }
  const maskOptions = {
    ...options,
    dslNodeType: tagName
  };
  delete maskOptions.tagName;
  return SPISelectorFactory.GeneratorToken(MASK_WIDGET_STORAGE_KEY, maskOptions);
};

ViewWidget.Selector = (options) => {
  const { tagName } = options;
  let maskOptions: IViewFilterOptions;
  if (tagName) {
    maskOptions = {
      ...options,
      dslNodeType: tagName
    };
    delete maskOptions.tagName;
  } else {
    maskOptions = options;
  }
  return SPIOperator.selector(MASK_WIDGET_STORAGE_KEY, maskOptions);
};

@SPIFactory.Storage<BaseMaskWidget, BaseMaskOptions>(['dslNodeType', 'widget'], {
  key: MASK_WIDGET_STORAGE_KEY,
  tokenGenerator: (storageKey, options) => {
    const { dslNodeType } = options;
    if (dslNodeType) {
      const maskTagManager = getMaskTagManagerInstance();
      if (maskTagManager && !maskTagManager.isInternalWidget(dslNodeType)) {
        maskTagManager.register(dslNodeType);
      }
    }
    return SPISelectorFactory.GeneratorToken(storageKey, options);
  }
})
export class BaseMaskWidget<Props extends BaseMaskWidgetProps = BaseMaskWidgetProps> extends DslRenderWidget<Props> {
  protected $$innerWidgetType = InnerWidgetType.Mask;

  public static Token: SPITokenFactory<BaseMaskOptions>;

  public static Selector: SPISingleSelector<BaseMaskOptions, Constructor<BaseMaskWidget>>;

  @Widget.Reactive()
  protected automatic = false;

  @Widget.Reactive()
  protected loading = false;

  @Widget.Reactive()
  protected readonly currentHandle: string;

  public getCurrentHandle() {
    return this.currentHandle;
  }

  public constructor(handle?: string) {
    super(handle);
    this.currentHandle = this.getHandle();
  }

  public initialize(props: Props) {
    if (props.slotNames == null) {
      props.slotNames = [DEFAULT_SLOT_NAME];
    }
    super.initialize(props);
    this.automatic = props.automatic || false;
    return this;
  }

  @Widget.Reactive()
  public get classNames(): string[] | undefined {
    const classNames = this.getDsl().class;
    if (classNames) {
      return StringHelper.append([], classNames);
    }
  }

  @Widget.Reactive()
  public get style(): CSSStyle | undefined {
    return StyleHelper.convertStyleByDslDefinition(this.getDsl());
  }

  /**
   * 获取url参数
   */
  public getUrlParameters(): Record<string, unknown> {
    const { page = {} } = useMatched().matched.segmentParams;
    return page;
  }

  public async load<R>(fn: (...args) => R, ...args): Promise<R> {
    this.loading = true;
    try {
      return await fn(...args);
    } finally {
      this.loading = false;
    }
  }

  public render(ctx?: Record<string, unknown>, slots?: Slots): VNode | VNode[] {
    const template = (ctx?.dslDefinition || this.template) as DslDefinition;
    if (template && this.supportedSlotNames.length) {
      this.dslSlots = DslSlotUtils.fetchSlotsBySlotNames(template, this.supportedSlotNames);
      this.slots = DslRender.renderSlots(this.dslSlots);
    }
    return super.render(ctx, slots);
  }
}
