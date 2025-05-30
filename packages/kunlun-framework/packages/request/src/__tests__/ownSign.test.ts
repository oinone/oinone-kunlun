/**
 * @jest-environment jsdom
 */

import { createOwnSignComponent, setActive } from '../ownSign';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

describe('createOwnSignComponent测试', () => {
  let createElementMock;
  let appendChildMock;
  let removeChildMock;
  let styleMock;
  let addEventListenerMock;

  // use to set
  window.location = {};

  beforeEach(() => {
    setActive(false);
    // 设置mock的localStorage

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    mockLocalStorage.clear();
    addEventListenerMock = jest.fn();
    // 创建DOM元素mock
    createElementMock = {
      style: {},
      addEventListener: addEventListenerMock,
      removeEventListener: jest.fn(),
      getBoundingClientRect: jest.fn().mockReturnValue({ left: 0, top: 0 }),
      remove: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn()
    };

    // 创建DOM操作mock
    appendChildMock = jest.fn();
    removeChildMock = jest.fn();
    document.body.appendChild = appendChildMock;
    document.body.removeChild = removeChildMock;

    document.addEventListener = addEventListenerMock;

    // 创建元素样式mock
    styleMock = {};
    createElementMock.style = styleMock;

    // Mock document.createElement
    document.createElement = jest.fn().mockReturnValue(createElementMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  test('should not create component if already active', () => {
    mockLocalStorage.getItem.mockReturnValue('active');
    // 第一次调用激活组件
    createOwnSignComponent();
    // 第二次调用应该不执行任何操作
    createOwnSignComponent();

    // 验证只创建了一次ownSign div strong button
    expect(document.createElement).toHaveBeenCalledTimes(3);
  });

  test('should create component and apply styles when ownSign exists', () => {
    // 设置localStorage返回值
    mockLocalStorage.getItem.mockReturnValue('testSign');

    createOwnSignComponent();

    // 验证创建了元素
    expect(document.createElement).toHaveBeenCalledWith('div');
    // 验证应用了样式
    expect(createElementMock.style.position).toBe('fixed');
    expect(createElementMock.style.height).toBe('min-content');
    // 验证添加了按钮和事件监听器
    expect(createElementMock.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  test('should remove sign when ownSign is null', () => {
    mockLocalStorage.getItem.mockReturnValue('null');

    createOwnSignComponent();

    // 验证移除了localStorage
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ownSign');
    // 验证移除了元素
    expect(createElementMock.remove).toHaveBeenCalled();
  });

  test('should handle drag functionality', () => {
    // 设置localStorage返回值
    mockLocalStorage.getItem.mockReturnValue('testSign');

    createOwnSignComponent();

    // 获取startDrag函数
    const startDrag = addEventListenerMock.mock.calls.find((call) => call[0] === 'mousedown')[1];
    // 执行拖动操作
    startDrag({ preventDefault: jest.fn(), clientX: 100, clientY: 100 });

    // 获取drag函数
    const drag = addEventListenerMock.mock.calls.find((call) => call[0] === 'mousemove')[1];
    // 模拟拖动
    drag({ clientX: 150, clientY: 150 });

    // 验证样式更新
    expect(styleMock.left).toBeDefined();
    expect(styleMock.top).toBeDefined();
  });

  test('should remove ownSign and redirect when button is clicked', () => {
    // 设置localStorage返回值
    mockLocalStorage.getItem.mockReturnValue('testSign');

    createOwnSignComponent();

    // 获取删除按钮点击函数
    const clickHandler = addEventListenerMock.mock.calls.find((call) => call[0] === 'click')[1];
    // 模拟点击删除按钮
    clickHandler();

    // 验证localStorage被清除
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ownSign');
    // 验证元素被移除
    expect(createElementMock.remove).toHaveBeenCalled();
  });
});
