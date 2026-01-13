import { ComputeContextManager } from '../../compute-context-manager';
import { view, type ViewData } from '../data';
import { createRuntimeContextByView } from './helper';

const runtimeContext = createRuntimeContextByView(view, false);

async function init(): Promise<ViewData> {
  const res = (await runtimeContext.getInitialValue()) as unknown as ViewData;
  res.price = 100;
  res.count = 2;
  res.sum = 200;
  console.log('initial value: ', res);
  return res;
}

let counter = 0;

function change<K extends keyof ViewData, V = ViewData[K]>(res: ViewData, field: K, value: V) {
  counter++;
  const oldValue = res[field];
  console.log(`change${counter} ${field}: `, oldValue, '-->', value);
  res[field] = value;
  compute(res, field as string);
}

function compute(res: Record<string, unknown>, field: string) {
  ComputeContextManager.get(runtimeContext.handle)?.compute(
    {
      activeRecords: [res],
      rootRecord: res, // fixme @zbh 20230901 此处无法正确获取真正的rootRecord
      openerRecord: {},
      scene: runtimeContext.viewAction?.name || '',
      activeRecord: res
    },
    runtimeContext.getModelField(field)?.modelField
  );
  console.log(`compute${counter}: `, res);
}

async function test() {
  const res = await init();
  console.time('timer');
  change(res, 'price', 150);
  console.timeLog('timer');
  change(res, 'count', 4);
  console.timeLog('timer');
  change(res, 'sum', 700);
  console.timeLog('timer');
  console.timeEnd('timer');
}

test();
