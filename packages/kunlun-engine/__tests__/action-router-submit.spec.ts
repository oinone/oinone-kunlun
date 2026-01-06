import { ViewActionTarget } from '@oinone/kunlun-meta';
import { callFunction } from '@oinone/kunlun-service';
import { executeServerAction, runServerAction } from '../src/action/implementation/server';
import { executeUrlAction } from '../src/action/implementation/url';
import { RedirectTargetEnum } from '../src/action/typing';
import { ActiveRecordsOperator } from '../src/submit/ActiveRecordsOperator';

jest.mock('@oinone/kunlun-service', () => {
  return {
    callFunction: jest.fn()
  };
});

jest.mock('../src/helper', () => {
  return {
    requestMutationByActionElement: jest.fn()
  };
});

describe('action implementation', () => {
  it('executeServerAction calls callFunction with correct parameters', () => {
    const action: any = {
      model: 'demo.Model',
      sessionPath: '/session/path'
    };
    const param = { a: 1 };
    executeServerAction(action, param);
    expect(callFunction).toHaveBeenCalledWith(
      'demo.Model',
      action,
      param,
      undefined,
      { path: '/session/path' },
      { maxDepth: 1 }
    );
  });

  it('runServerAction delegates to requestMutationByActionElement', () => {
    const helper = require('../src/helper');
    const action: any = { model: 'demo.Model' };
    const actionElement: any = { name: 'testAction' };
    const param = { a: 1 };
    runServerAction(action, actionElement, param);
    expect(helper.requestMutationByActionElement).toHaveBeenCalledWith(action, actionElement, param, { maxDepth: 1 });
  });

  it('executeUrlAction opens url with correct target', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    executeUrlAction({
      url: 'http://example.com',
      target: ViewActionTarget.Router
    } as any);
    expect(openSpy).toHaveBeenCalledWith('http://example.com', RedirectTargetEnum.SELF);
    openSpy.mockRestore();
  });
});

describe('ActiveRecordsOperator', () => {
  it('repairRecords converts single record to list and fills draft id', () => {
    const record: any = { id: '1' };
    const list = ActiveRecordsOperator.repairRecords(record);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('1');
    expect(list[0].__draftId).toBeDefined();
  });

  it('convertActiveRecord keeps existing draft id and parent options', () => {
    const record: any = { id: '1', __draftId: 'draft-1' };
    const converted = ActiveRecordsOperator.convertActiveRecord(record, true);
    expect(converted?.__draftId).toBe('draft-1');
  });
});
