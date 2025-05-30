import { createVNode, VNode } from 'vue';
import { TableStringHyperlinksFieldWidget } from './TableStringHyperlinksFieldWidget';

const TEST_URL = 'https://example.com';
const TEST_TEXT = 'Test Link';
const TEST_TARGET = 'Router';
const TEST_DEFAULT_VALUE = 'Default Link';

describe.skip('TableStringHyperlinksFieldWidget', () => {
  let widget: TableStringHyperlinksFieldWidget;

  beforeEach(() => {
    widget = new TableStringHyperlinksFieldWidget();
    // Mock getDsl method to return specific values for testing
    jest.spyOn(widget, 'getDsl').mockReturnValue({
      text: TEST_TEXT,
      target: TEST_TARGET,
      defaultValue: TEST_DEFAULT_VALUE
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('renderDefaultSlot', () => {
    test('should render a link with correct attributes when currentValue is provided', () => {
      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      expect(result).toHaveLength(1);
      const divNode = result[0] as VNode;
      expect(divNode.type).toBe('div');
      expect(divNode.props?.class).toBe('default-table-hyperlinks');

      const aNode = divNode.children?.[0] as VNode;
      expect(aNode.type).toBe('a');
      expect(aNode.props?.href).toBe(TEST_URL);
      expect(aNode.props?.title).toBe(TEST_URL);
      expect(aNode.children).toBe(TEST_TEXT);
    });

    test('should use defaultValue when currentValue is empty', () => {
      const context = { record: { value: '' } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.href).toBe(TEST_DEFAULT_VALUE);
      expect(aNode.children).toBe(TEST_DEFAULT_VALUE);
    });

    test('should use defaultValue when currentValue is undefined', () => {
      const context = { record: {} };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.href).toBe(TEST_DEFAULT_VALUE);
      expect(aNode.children).toBe(TEST_DEFAULT_VALUE);
    });

    test('should use currentValue as text when text is not provided', () => {
      jest.spyOn(widget, 'getDsl').mockReturnValue({
        text: '',
        target: 'OpenWindow',
        defaultValue: TEST_DEFAULT_VALUE
      });

      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.href).toBe(TEST_URL);
      expect(aNode.children).toBe(TEST_URL);
    });

    test('should set target to _blank when target is OpenWindow', () => {
      jest.spyOn(widget, 'getDsl').mockReturnValue({
        text: TEST_TEXT,
        target: 'OpenWindow',
        defaultValue: TEST_DEFAULT_VALUE
      });

      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.target).toBe('_blank');
    });

    test('should set target to _self when target is Router', () => {
      jest.spyOn(widget, 'getDsl').mockReturnValue({
        text: TEST_TEXT,
        target: TEST_TARGET,
        defaultValue: TEST_DEFAULT_VALUE
      });

      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.target).toBe('_self');
    });

    test('should set target to _blank when target is unknown', () => {
      jest.spyOn(widget, 'getDsl').mockReturnValue({
        text: TEST_TEXT,
        target: 'UnknownTarget',
        defaultValue: TEST_DEFAULT_VALUE
      });

      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.target).toBe('_blank');
    });

    // 新增测试 case
    test('should set target to _blank when target is Blank', () => {
      jest.spyOn(widget, 'getDsl').mockReturnValue({
        text: TEST_TEXT,
        target: 'Blank',
        defaultValue: TEST_DEFAULT_VALUE
      });

      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.target).toBe('_blank');
    });

    test('should set target to _self when target is Self', () => {
      jest.spyOn(widget, 'getDsl').mockReturnValue({
        text: TEST_TEXT,
        target: 'Self',
        defaultValue: TEST_DEFAULT_VALUE
      });

      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.target).toBe('_self');
    });

    test('should set target to _parent when target is Parent', () => {
      jest.spyOn(widget, 'getDsl').mockReturnValue({
        text: TEST_TEXT,
        target: 'Parent',
        defaultValue: TEST_DEFAULT_VALUE
      });

      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.target).toBe('_parent');
    });

    test('should set target to _top when target is Top', () => {
      jest.spyOn(widget, 'getDsl').mockReturnValue({
        text: TEST_TEXT,
        target: 'Top',
        defaultValue: TEST_DEFAULT_VALUE
      });

      const context = { record: { value: TEST_URL } };
      const result = widget.renderDefaultSlot(context);

      const aNode = (result[0] as VNode).children?.[0] as VNode;
      expect(aNode.props?.target).toBe('_top');
    });
  });
});
