import {
  ActiveRecord,
  ActiveRecordExtendKeys,
  ActiveRecords,
  ActiveRecordsOperator,
  EventKeys,
  getRefreshParameters,
  IPopupInstance,
  IPopupWidget,
  isRelationField,
  PopupManager,
  RelationUpdateType,
  RuntimeAction,
  RuntimeViewAction,
  SubmitValue
} from '@oinone/kunlun-engine';
import { ExpressionRunParam } from '@oinone/kunlun-expression';
import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, CallChaining, ObjectUtils, Optional } from '@oinone/kunlun-shared';
import { ActiveRecordsWidget, ActiveRecordsWidgetProps, Widget } from '@oinone/kunlun-vue-widget';
import { isArray, isFunction, isNil } from 'lodash-es';
import { computed } from 'vue';
import { validatorCallChainingCallAfterFn } from '../../basic/constant';
import { useInjectMetaContext, useProviderMetaContext } from '../../tags';
import {
  ClickResult,
  PopupEventHandle,
  PopupEventHandles,
  PopupScene,
  PopupSubmitOptions,
  PopupSubmitParameters,
  PopupSubmitType
} from '../../typing';
import { executeMapping } from '../../util';

export interface PopupWidgetProps extends ActiveRecordsWidgetProps {
  mountedVisible?: boolean;
}

/**
 * 弹出层组件，如弹出框、抽屉等
 */
export abstract class PopupWidget<Props extends PopupWidgetProps = PopupWidgetProps>
  extends ActiveRecordsWidget<Props>
  implements IPopupWidget<Props>
{
  private handlers: PopupEventHandle = { cancel: [], ok: [] };

  @Widget.Reactive()
  @Widget.Inject()
  protected openerDataSource: ActiveRecord[] | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected openerActiveRecords: ActiveRecord[] | undefined;

  @Widget.Reactive()
  protected get popupSubmitType(): PopupSubmitType {
    return (this.getDsl()?.submitType?.toLowerCase?.() as PopupSubmitType) || PopupSubmitType.current;
  }

  @Widget.Reactive()
  protected get viewType(): ViewType {
    return this.getDsl()?.type as unknown as ViewType;
  }

  @Widget.Reactive()
  protected get maskClosable(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().maskClosable) || false;
  }

  @Widget.Reactive()
  protected get mask(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().mask) ?? true;
  }

  @Widget.Reactive()
  protected get closable(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().closable) ?? true;
  }

  @Widget.Reactive()
  protected currentRelationUpdateType: RelationUpdateType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get relationUpdateType(): RelationUpdateType {
    return (
      this.currentRelationUpdateType ||
      (this.getDsl().relationUpdateType?.toLowerCase?.() as RelationUpdateType) ||
      RelationUpdateType.default
    );
  }

  protected abstract getPopupScene(): PopupScene | string;

  @Widget.Reactive()
  @Widget.Provide()
  protected get popupScene(): string {
    return this.getPopupScene();
  }

  protected get action(): RuntimeViewAction | undefined {
    return this.metadataRuntimeContext.viewAction;
  }

  @Widget.Reactive()
  @Widget.Provide()
  public get dataSource(): ActiveRecord[] | undefined {
    return this.getCurrentDataSource() || undefined;
  }

  public reloadDataSource(records: ActiveRecords | undefined) {
    this.setCurrentDataSource(records);
  }

  @Widget.Reactive()
  @Widget.Provide()
  public get activeRecords(): ActiveRecord[] | undefined {
    return this.getCurrentActiveRecords();
  }

  public reloadActiveRecords(records: ActiveRecords | undefined) {
    this.setCurrentActiveRecords(records);
  }

  public flushDataSource() {
    // do nothing
  }

  /**
   * 这里某个组件需要知道自己在某个特定组件中，进行特殊逻辑处理，暂时先使用这种方式进行识别
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected isCard = false;

  @Widget.Provide()
  protected currentMountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get mountedCallChaining(): CallChaining | undefined {
    return this.currentMountedCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('refreshCallChaining')
  protected parentRefreshCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  protected currentRefreshCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get refreshCallChaining(): CallChaining<boolean> | undefined {
    return this.currentRefreshCallChaining || this.parentRefreshCallChaining;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected submitCallChaining: CallChaining<SubmitValue> | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected validatorCallChaining: CallChaining<boolean> | undefined;

  /**
   * 置空cols属性
   */
  @Widget.Reactive()
  @Widget.Provide()
  public cols: number | undefined;

  @Widget.Reactive()
  private visible = false;

  @Widget.Reactive()
  private mountedVisible = false;

  @Widget.Reactive()
  private get openHandle() {
    return this.getDsl().openHandle;
  }

  public initialize(props: Props) {
    super.initialize(props);
    this.mountedVisible = Optional.ofNullable(props.mountedVisible).orElse(true)!;
    return this;
  }

  @Widget.Method()
  public async onOk() {
    await this.onNotify('ok');
  }

  @Widget.Method()
  public async onCancel() {
    await this.onNotify('cancel');
  }

  @Widget.Reactive()
  public get isVisible(): boolean {
    return this.visible;
  }

  public beforeClose;

  @Widget.Method()
  public async onVisibleChange<Action extends RuntimeAction = RuntimeAction>(visible: boolean, triggerAction?: Action) {
    if (!visible && isFunction(this.beforeClose)) {
      const canClose = await this.beforeClose(triggerAction);
      if (!canClose) {
        return;
      }
    }
    this.visible = visible;
    const popupInstance = this.findPopupInstance();
    if (popupInstance) {
      PopupManager.INSTANCE.notifyHandler(visible ? EventKeys.open : EventKeys.close, popupInstance, triggerAction);
    }
  }

  @Widget.Method()
  @Widget.Inject('onSubmit')
  public onSubmitToParent: ((parameters: PopupSubmitParameters) => ClickResult) | undefined;

  @Widget.Method()
  @Widget.Inject('onCancel')
  public onCancelToParent: ((parameters: PopupSubmitParameters) => ClickResult) | undefined;

  @Widget.Method()
  @Widget.Provide('onSubmit')
  private async onSubmitProvider(options?: PopupSubmitOptions) {
    if (isFunction(this.onSubmitToParent)) {
      let finalParameters: PopupSubmitParameters;
      if (options?.parameters) {
        finalParameters = options.parameters;
      } else {
        switch (this.popupSubmitType) {
          case PopupSubmitType.current: {
            let result: ActiveRecords = [];
            if (this.submitCallChaining) {
              result = (await this.submitCallChaining.syncCall())?.records || [];
            }
            let finalShowRecords: ActiveRecord[] = this.activeRecords || [];
            const viewAction = this.action;
            if (viewAction) {
              const { model, resModel } = viewAction;
              if (model && resModel && model !== resModel) {
                finalShowRecords = ActiveRecordsOperator.repairRecordsNullable(result) || [];
              }
            }
            finalParameters = {
              showRecords: finalShowRecords,
              submitRecords: result
            };
            break;
          }
          case PopupSubmitType.all: {
            const result: ActiveRecord[] = this.dataSource || [];
            finalParameters = {
              showRecords: result,
              submitRecords: result
            };
            break;
          }
        }
      }
      Optional.ofNullable(options)
        .map<Record<string, unknown>>((v) => v!.mapping!)
        .filter((v) => !!Object.keys(v).length)
        .ifPresent((mapping) => {
          finalParameters = this.executeMapping(finalParameters, mapping);
        });
      return this.onSubmitToParent(finalParameters);
    }
    PopupManager.INSTANCE.dispose(this.getHandle(), options?.action);
    return false;
  }

  @Widget.Method()
  @Widget.Provide('onCancel')
  private async onCancelProvider() {
    if (isFunction(this.onCancelToParent)) {
      let result: ActiveRecords = [];
      if (this.submitCallChaining) {
        result = (await this.submitCallChaining.syncCall())?.records || [];
      }
      return this.onCancelToParent({ showRecords: this.activeRecords || [], submitRecords: result });
    }
    PopupManager.INSTANCE.dispose(this.getHandle());
    return false;
  }

  protected isSameModel(): boolean {
    const { model, field, viewAction } = this.metadataRuntimeContext;
    let isSameModel = false;
    let originModel = viewAction?.model;
    if (isNil(originModel) && field && isRelationField(field)) {
      originModel = field.references;
    }
    if (originModel) {
      isSameModel = model.model === originModel;
    }
    return isSameModel;
  }

  protected executeMapping(parameters: PopupSubmitParameters, mapping: Record<string, unknown>): PopupSubmitParameters {
    const isSameModel = this.isSameModel();
    let { showRecords, submitRecords } = parameters;
    showRecords = this.$$executeMapping(showRecords, mapping, isSameModel);
    if (isArray(submitRecords)) {
      submitRecords = this.$$executeMapping(submitRecords, mapping, isSameModel);
    } else {
      [submitRecords] = this.$$executeMapping([submitRecords], mapping, isSameModel);
    }
    return {
      showRecords,
      submitRecords
    };
  }

  protected $$executeMapping(
    records: ActiveRecord[],
    mapping: Record<string, unknown>,
    isSameModel: boolean
  ): ActiveRecord[] {
    return records.map((record) => {
      const mappingExecuteParameters: ExpressionRunParam = {
        activeRecords: records,
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        scene: this.action?.name || '',
        activeRecord: record
      };
      let target: ActiveRecord;
      if (isSameModel) {
        target = record;
      } else {
        target = {};
        Object.values(ActiveRecordExtendKeys).forEach((key) => {
          ObjectUtils.safeSetter(target, record, key);
        });
      }
      executeMapping(mappingExecuteParameters, target, mapping);
      return target;
    });
  }

  private onNotify(type: keyof PopupEventHandles) {
    this.handlers[type]?.forEach((handle) => handle?.());
  }

  public on(type: keyof PopupEventHandles, handler: Function) {
    let queue = this.handlers[type];
    if (!queue) {
      queue = [];
      this.handlers[type] = queue;
    }
    queue.push(handler);
  }

  protected findPopupInstance(): IPopupInstance | undefined {
    const key = this.getHandle();
    return PopupManager.INSTANCE.getInstances(this.getPopupScene()).find((v) => v.key === key);
  }

  protected $$beforeCreated() {
    super.$$beforeCreated();
    const metaContext = useInjectMetaContext();
    useProviderMetaContext({
      ...metaContext,
      parentHandle: computed(() => this.getHandle()),
      slotName: computed(() => undefined)
    });
    let popupInstance = this.findPopupInstance();
    if (!popupInstance) {
      popupInstance = {
        type: this.popupScene,
        key: this.getHandle(),
        initialConfig: {
          action: this.action
        },
        widget: this
      };
      PopupManager.INSTANCE.push(popupInstance, false);
    }
  }

  protected $$created() {
    super.$$created();
    const popupInstance = this.findPopupInstance();
    if (popupInstance) {
      PopupManager.INSTANCE.notifyHandler(EventKeys.created, popupInstance);
    }
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.currentMountedCallChaining = new CallChaining();
    this.currentRefreshCallChaining = new CallChaining();
    this.submitCallChaining = new CallChaining();
    this.validatorCallChaining = new CallChaining();
  }

  protected $$mounted() {
    super.$$mounted();
    this.currentRefreshCallChaining?.callBefore(
      (...args) => {
        const { refreshParent } = getRefreshParameters(args);
        if (refreshParent) {
          this.parentRefreshCallChaining?.syncCall();
          return false;
        }
        return true;
      },
      { immutable: true }
    );
    this.submitCallChaining?.callAfter(
      (args, callBeforeResult, { status, results }) => {
        const result = results[0];
        if (status && result) {
          return new SubmitValue(ActiveRecordsOperator.repairRecords(result.records));
        }
        return new SubmitValue([]);
      },
      { force: true, immutable: false }
    );
    this.validatorCallChaining?.callAfter(validatorCallChainingCallAfterFn, { force: true, immutable: false });
    if (this.mountedVisible) {
      this.onVisibleChange(true);
    }
  }

  public dispose(force = false) {
    super.dispose(force);
    const popupInstance = this.findPopupInstance();
    if (popupInstance) {
      PopupManager.INSTANCE.notifyHandler(EventKeys.dispose, popupInstance);
    }
  }

  @Widget.Method()
  protected allMounted() {
    this.mountedCallChaining?.syncCall();
  }
}
