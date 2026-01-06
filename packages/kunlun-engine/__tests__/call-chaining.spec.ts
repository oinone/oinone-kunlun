import {
  getRefreshParameters,
  type RefreshCallChainingParameters,
  RefreshCallChainingScope
} from '../src/call-chaining/refresh';
import { getReloadMainViewParameters, getReloadMaskParameters } from '../src/call-chaining/reload-main-view';
import { getValidatorParameters, type ValidatorCallChainingParameters } from '../src/call-chaining/validator';

describe('call-chaining refresh', () => {
  it('getRefreshParameters returns default when args is undefined', () => {
    const params = getRefreshParameters(undefined);
    expect(params.refreshParent).toBe(false);
    expect(params.scope).toBeUndefined();
  });

  it('getRefreshParameters handles boolean argument', () => {
    const paramsTrue = getRefreshParameters([true]);
    expect(paramsTrue.refreshParent).toBe(true);
    const paramsFalse = getRefreshParameters([false]);
    expect(paramsFalse.refreshParent).toBe(false);
  });

  it('getRefreshParameters returns object parameter as is', () => {
    const origin: RefreshCallChainingParameters = {
      scope: RefreshCallChainingScope.search,
      refreshParent: true,
      currentPage: 2,
      pageSize: 10
    };
    const params = getRefreshParameters([origin]);
    expect(params).toBe(origin);
  });
});

describe('call-chaining reload main view', () => {
  it('getReloadMaskParameters throws when parameter is missing', () => {
    expect(() => getReloadMaskParameters(undefined)).toThrow('Invalid refresh main view parameters');
    expect(() => getReloadMaskParameters([undefined])).toThrow('Invalid refresh main view parameters');
  });

  it('getReloadMaskParameters returns parameter when present', () => {
    const origin = {
      module: 'm',
      model: 'Model',
      action: 'act',
      currentPage: {}
    };
    const params = getReloadMaskParameters([origin]);
    expect(params).toBe(origin);
  });

  it('getReloadMainViewParameters throws when parameter is missing', () => {
    expect(() => getReloadMainViewParameters(undefined)).toThrow('Invalid refresh main view parameters');
    expect(() => getReloadMainViewParameters([undefined])).toThrow('Invalid refresh main view parameters');
  });

  it('getReloadMainViewParameters returns parameter when present', () => {
    const origin = {
      handle: 'h',
      module: 'm',
      model: 'Model',
      action: 'act',
      currentPage: {}
    };
    const params = getReloadMainViewParameters([origin]);
    expect(params).toBe(origin);
  });
});

describe('call-chaining validator', () => {
  it('getValidatorParameters returns default when args is undefined', () => {
    const params = getValidatorParameters(undefined);
    expect(params.notify).toBe(true);
    expect(params.sendErrorMessage).toBeUndefined();
  });

  it('getValidatorParameters handles boolean argument', () => {
    const paramsTrue = getValidatorParameters([true]);
    expect(paramsTrue.notify).toBe(true);
    const paramsFalse = getValidatorParameters([false]);
    expect(paramsFalse.notify).toBe(false);
  });

  it('getValidatorParameters returns object parameter as is', () => {
    const origin: ValidatorCallChainingParameters = {
      notify: false,
      sendErrorMessage: true
    };
    const params = getValidatorParameters([origin]);
    expect(params).toBe(origin);
  });
});
