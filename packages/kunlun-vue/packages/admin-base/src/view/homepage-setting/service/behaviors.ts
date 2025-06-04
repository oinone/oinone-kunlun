import { BehaviorSubject, Subject } from '@oinone/kunlun-state';

export const RenderWidgetsBehavior = new BehaviorSubject<{ emitName: string; arg?: unknown }>(null as any);
export const ValidateWidgetsBehavior = new Subject<string>();
