import {
  DEFAULT_SLOT_NAME,
  DslDefinitionType,
  type ElementDslDefinition,
  type PackDslDefinition,
  type TemplateDslDefinition
} from '@oinone/kunlun-dsl';
import type { Component } from 'vue';
import { DslRender, DEFAULT_TAG_PREFIX } from '../dsl-render';

jest.mock('vue', () => {
  const actual = jest.requireActual('vue');
  return {
    ...actual,
    resolveDynamicComponent: (name: string | Component) => {
      if (typeof name === 'string') {
        return name;
      }
      return name;
    }
  };
});

describe('DslRender', () => {
  it('fetchComponent: VIEW 类型应使用前缀和 dslNodeType 组合', () => {
    const dsl = { dslNodeType: DslDefinitionType.VIEW } as any;
    const component = DslRender.fetchComponent(dsl);
    expect(component).toBe(`${DEFAULT_TAG_PREFIX}-${DslDefinitionType.VIEW}`);
  });

  it('fetchComponent: PACK 类型应优先使用 widget 字段, 失败时回退到 dslNodeType', () => {
    const dsl: PackDslDefinition = {
      dslNodeType: DslDefinitionType.PACK,
      widget: 'MyWidget'
    } as any;
    const component = DslRender.fetchComponent(dsl);
    expect(component).toBe('pack');
  });

  it('fetchComponent: ELEMENT 类型应优先使用 widget 字段, 失败时回退到 dslNodeType', () => {
    const dsl: ElementDslDefinition = {
      dslNodeType: DslDefinitionType.ELEMENT,
      widget: 'MyElement'
    } as any;
    const component = DslRender.fetchComponent(dsl);
    expect(component).toBe('element');
  });

  it('fetchComponent: UNKNOWN/SLOT/TEMPLATE 类型返回 null, 其他未知类型走公共解析逻辑', () => {
    expect(
      DslRender.fetchComponent({
        dslNodeType: DslDefinitionType.SLOT
      } as any)
    ).toBeNull();

    const unknownComponent = DslRender.fetchComponent({
      dslNodeType: 'CustomType' as any
    } as any);
    expect(unknownComponent).toBe('CustomType');
  });

  it('renderSlots: 应根据 dslSlots 生成对应插槽', () => {
    const dslSlots = {
      default: {
        dslNodeType: DslDefinitionType.TEMPLATE,
        slot: DEFAULT_SLOT_NAME,
        widgets: [
          {
            dslNodeType: DslDefinitionType.ELEMENT,
            widget: 'div'
          } as any
        ]
      }
    } as any;

    const slots = DslRender.renderSlots(dslSlots);
    expect(slots.default).toBeInstanceOf(Function);
  });

  it('fetchVNodeSlots: 有缓存时直接返回, 无缓存时根据 TemplateDslDefinition 推导插槽名', () => {
    const dsl: any = {
      dslNodeType: DslDefinitionType.VIEW,
      widgets: [
        {
          dslNodeType: DslDefinitionType.TEMPLATE,
          slot: 'header'
        } as TemplateDslDefinition,
        {
          dslNodeType: DslDefinitionType.TEMPLATE
        } as TemplateDslDefinition
      ]
    };

    const slots = DslRender.fetchVNodeSlots(dsl);
    expect(slots).toBeDefined();
  });

  it('render: component 不存在时返回 undefined, 存在时调用 createVNodeWithDslDefinition', () => {
    const dsl: any = {
      dslNodeType: DslDefinitionType.UNKNOWN
    };
    expect(DslRender.render(dsl)).toBeUndefined();

    const elementDsl: ElementDslDefinition = {
      dslNodeType: DslDefinitionType.ELEMENT,
      widget: 'div'
    } as any;

    const vnode = DslRender.render(elementDsl, DEFAULT_SLOT_NAME);
    expect(vnode).toBeTruthy();
  });
});
