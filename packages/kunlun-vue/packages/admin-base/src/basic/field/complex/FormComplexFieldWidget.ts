import {
  ActiveRecords,
  resolveDynamicDomain,
  RuntimeModel,
  RuntimeRelationField,
  SubmitCacheManager
} from '@kunlun/engine';
import { isDev } from '@kunlun/router';
import { CallChaining, ReturnPromise } from '@kunlun/shared';
import { Widget } from '@kunlun/vue-widget';
import { SUBVIEW_WIDGET_PRIORITY } from '../../constant';
import { BaseFieldProps } from '../../token';
import { FormFieldWidget } from '../FormFieldWidget';

export type FormComplexFieldProps<Field extends RuntimeRelationField = RuntimeRelationField> = BaseFieldProps<Field>;

export abstract class FormComplexFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends FormFieldWidget<Value, Field, Props> {
  /**
   * 是否是数据源提供者
   * @protected
   */
  @Widget.Reactive()
  protected isDataSourceProvider = true;

  protected get submitCache(): SubmitCacheManager | undefined {
    return this.field.submitCache;
  }

  @Widget.Reactive()
  protected get referencesModel(): RuntimeModel | undefined {
    return this.field.referencesModel;
  }

  @Widget.Reactive()
  @Widget.Inject('mountedCallChaining')
  protected parentMountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  protected currentMountedCallChaining: CallChaining | undefined;

  /**
   * 挂载时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get mountedCallChaining(): CallChaining | undefined {
    return this.currentMountedCallChaining || this.parentMountedCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('refreshCallChaining')
  protected parentRefreshCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  protected currentRefreshCallChaining: CallChaining<boolean> | undefined;

  /**
   * 刷新时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get refreshCallChaining(): CallChaining<boolean> | undefined {
    return this.currentRefreshCallChaining;
  }

  @Widget.Reactive()
  protected get filter(): string | undefined {
    const filter = this.field.filter;
    if (filter) {
      return this.resolveDynamicDomain(filter);
    }
    return filter;
  }

  @Widget.Reactive()
  protected get domain(): string | undefined {
    const domain = this.field.domain;
    if (domain) {
      return this.resolveDynamicDomain(domain);
    }
    return domain;
  }

  public initialize(props: Props) {
    super.initialize(props);
    const { referencesModel } = this;
    if (referencesModel) {
      this.initSubmitCache(referencesModel);
    } else if (isDev()) {
      console.error('Invalid references model define.', this);
    }
    return this;
  }

  protected initSubmitCache(referencesModel: RuntimeModel) {
    const { excludeItems } = this.getDsl();
    const submitCache = new SubmitCacheManager({
      model: referencesModel.model,
      pks: referencesModel.pks,
      uniques: referencesModel.uniques
    });
    submitCache.setExcludes(excludeItems);
    this.field.submitCache = submitCache;
  }

  protected resolveDynamicDomain(domain: string): string {
    return resolveDynamicDomain(
      domain,
      this.formData,
      this.rootData?.[0] || {},
      this.openerActiveRecords?.[0] || {},
      this.scene,
      this.parentViewActiveRecords?.[0] || {}
    );
  }

  /**
   * 挂载时处理
   * @protected
   */
  protected abstract mountedProcess(): ReturnPromise<void>;

  /**
   * 父视图刷新时处理
   * @protected
   */
  protected refreshParentProcess(): ReturnPromise<void> {
    // do nothing.
  }

  /**
   * 值刷新时处理
   * @protected
   */
  protected refreshValueProcess(): ReturnPromise<void> {
    // do nothing.
  }

  protected subscribeProcess() {
    this.reloadFormData$.subscribe(() => {
      if (this.value !== this.dataSource) {
        this.refreshValueProcess();
      }
    });
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    if (!this.currentMountedCallChaining) {
      this.currentMountedCallChaining = new CallChaining();
    }
    if (!this.currentRefreshCallChaining) {
      this.currentRefreshCallChaining = new CallChaining();
    }
  }

  protected $$mounted() {
    super.$$mounted();
    const { parentMountedCallChaining, parentRefreshCallChaining } = this;
    if (parentMountedCallChaining && !parentMountedCallChaining.isCalled) {
      parentMountedCallChaining.hook(
        this.path,
        () => {
          Promise.all([this.mountedProcess()]).then(() => {
            this.subscribeProcess();
            this.currentMountedCallChaining?.syncCall();
          });
        },
        SUBVIEW_WIDGET_PRIORITY
      );
    } else {
      Promise.all([this.mountedProcess()]).then(() => {
        this.subscribeProcess();
        this.currentMountedCallChaining?.syncCall();
      });
    }
    if (parentRefreshCallChaining) {
      parentRefreshCallChaining.hook(
        this.path,
        async () => {
          await this.refreshParentProcess();
          this.currentRefreshCallChaining?.syncCall();
        },
        SUBVIEW_WIDGET_PRIORITY
      );
    }
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.parentMountedCallChaining?.unhook(this.path);
    this.parentRefreshCallChaining?.unhook(this.path);
  }
}
