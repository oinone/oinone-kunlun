/**
 * @jest-environment jsdom
 */

import { DslSlotUtils } from '../util/index';
import { XMLParse } from '../parser/xml-parse';
import {
  baseTemplate,
  viewTemplate,
  resultTemplate,
  repeatSlotTemplate,
  viewRepeatSlotTemplate,
  invalidSlotTemplate,
  baseReverseMergeTemplate,
  reverseMergeDSLTemplate,
  reverseMergeResultTemplate,
  fetchSlotTemplate,
  hasRepeatSlotView,
  mergeAttrResult
} from './template';
import { DslSlots, DslDefinitionType, DslDefinition } from '../typing';

describe('DslSlotUtils', () => {
  describe('mergeSlotsToLayout', () => {
    it('合并基础模板', () => {
      const baseTemplateJSON = XMLParse.INSTANCE.parse(baseTemplate);
      const viewTemplateJSON = XMLParse.INSTANCE.parse(viewTemplate);
      const resultTemplateJSON = XMLParse.INSTANCE.parse(resultTemplate);
      const result = DslSlotUtils.mergeTemplateToLayout(baseTemplateJSON, viewTemplateJSON);
      expect(result).toEqual(resultTemplateJSON);
    });

    it('插槽检测: 插槽重复', () => {
      expect(() =>
        DslSlotUtils.mergeTemplateToLayout(
          XMLParse.INSTANCE.parse(repeatSlotTemplate),
          XMLParse.INSTANCE.parse(viewRepeatSlotTemplate)
        )
      ).toThrow('模板中不允许递归使用插槽进行二次处理');
    });

    it('插槽检测: 插槽值不存在', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      DslSlotUtils.mergeTemplateToLayout(
        XMLParse.INSTANCE.parse(baseTemplate),
        XMLParse.INSTANCE.parse(invalidSlotTemplate)
      );
      expect(consoleSpy).toHaveBeenCalledWith('Invalid template definition. slot must be not blank.');
    });

    it('反向合并', () => {
      expect(
        DslSlotUtils.mergeTemplateToLayout(
          XMLParse.INSTANCE.parse(baseReverseMergeTemplate),
          XMLParse.INSTANCE.parse(reverseMergeDSLTemplate)
        )
      ).toEqual(XMLParse.INSTANCE.parse(reverseMergeResultTemplate));
    });

    it('查找制定插槽，其他插槽置为默认', () => {
      const testJSON = XMLParse.INSTANCE.parse(fetchSlotTemplate);
      const result = DslSlotUtils.fetchSlotsBySlotNames(testJSON, ['actions']);
      expect(result).toHaveProperty('actions');
      expect(result).toHaveProperty('default');
      expect(result.default?.widgets).toHaveLength(3);
    });

    it('相同名称插槽将合并', () => {
      expect(
        DslSlotUtils.mergeTemplateToLayout(
          XMLParse.INSTANCE.parse(baseTemplate),
          XMLParse.INSTANCE.parse(hasRepeatSlotView)
        )
      ).toEqual(XMLParse.INSTANCE.parse(mergeAttrResult));
    });
  });

  describe('mergeSlotsToLayout', () => {
    it('只合并dslSlots中存在的', () => {
      const dsl: DslDefinition = {
        dslNodeType: DslDefinitionType.VIEW,
        widgets: [
          {
            dslNodeType: DslDefinitionType.ELEMENT,
            slot: 'actions',
            widgets: [{ name: 'submit1' } as unknown as DslDefinition]
          }
        ]
      };
      const template: DslDefinition = {
        dslNodeType: DslDefinitionType.VIEW,
        widgets: [
          {
            dslNodeType: DslDefinitionType.TEMPLATE,
            slot: 'actions',
            widgets: [{ name: 'reset' } as unknown as DslDefinition]
          },
          {
            dslNodeType: DslDefinitionType.TEMPLATE,
            slot: 'actions',
            widgets: [{ name: 'submit' } as unknown as DslDefinition]
          },
          {
            dslNodeType: DslDefinitionType.TEMPLATE,
            slot: 'actions',
            widgets: [{ name: 'tests' } as unknown as DslDefinition]
          }
        ]
      };
      const dslSlots: DslSlots = {
        actions: {
          dslNodeType: DslDefinitionType.TEMPLATE,
          slot: 'actions',
          widgets: [{ name: 'submit' } as unknown as DslDefinition]
        }
      };
      const result = DslSlotUtils.mergeSlotsToLayout(dsl, template, dslSlots);
      expect(result.widgets).toHaveLength(1);
      expect(result.widgets[0].widgets).toEqual([{ name: 'submit' }]);
    });
  });

  describe('fetchSlotsBySlotNames', () => {
    const dsl: DslDefinition = {
      dslNodeType: DslDefinitionType.VIEW,
      widgets: [
        {
          dslNodeType: DslDefinitionType.TEMPLATE,
          slot: 'actions',
          widgets: [{ name: 'submit' } as unknown as DslDefinition]
        }
      ]
    };
    it('正确获取到指定插槽', () => {
      const slotNames: string[] = ['actions'];

      const result = DslSlotUtils.fetchSlotsBySlotNames(dsl, slotNames);
      expect(result.actions?.widgets).toEqual([{ name: 'submit' }]);
    });

    it('无法获取到不存在插槽，并将其余插槽放入默认属性', () => {
      const slotNames: string[] = ['field'];

      const result = DslSlotUtils.fetchSlotsBySlotNames(dsl, slotNames);
      expect(result.actions).toBeUndefined();
      expect(result).toHaveProperty('default');
      // expect(result.default?.widgets).toEqual([{ name: 'submit' }]);
    });
  });
});
