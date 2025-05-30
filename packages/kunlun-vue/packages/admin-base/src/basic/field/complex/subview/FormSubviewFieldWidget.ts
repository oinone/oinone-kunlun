import { DslDefinition, DslDefinitionType } from '@kunlun/dsl';
import {
  ActiveRecord,
  ActiveRecords,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeRelationField,
  RuntimeView
} from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { ReturnPromise } from '@kunlun/shared';
import { Widget } from '@kunlun/vue-widget';
import { IFormSubviewFieldWidget } from '../../../types';
import { MetadataViewWidget } from '../../../view';
import { FormComplexFieldProps, FormComplexFieldWidget } from '../FormComplexFieldWidget';

export abstract class FormSubviewFieldWidget<
    Value extends ActiveRecords = ActiveRecords,
    Field extends RuntimeRelationField = RuntimeRelationField,
    Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
  >
  extends FormComplexFieldWidget<Value, Field, Props>
  implements IFormSubviewFieldWidget<Value, Field>
{
  protected metadataSubviewWidget!: MetadataViewWidget;

  protected runtimeSubviewContext!: RuntimeContext;

  protected defaultSubviewType = ViewType.Form;

  @Widget.Reactive()
  @Widget.Provide('parentViewActiveRecords')
  protected get currentParentViewActiveRecords(): ActiveRecord[] | undefined {
    return this.parentActiveRecords;
  }

  @Widget.Reactive()
  protected currentViewDsl: DslDefinition | undefined;

  @Widget.Reactive()
  protected get subviewType(): ViewType {
    return this.currentViewDsl?.type || this.defaultSubviewType;
  }

  @Widget.Reactive()
  protected get subviewModel(): string {
    return this.referencesModel?.model || this.field.references || super.model.model;
  }

  @Widget.Reactive()
  protected get subviewModelName(): string | undefined {
    return this.referencesModel?.name;
  }

  @Widget.Reactive()
  protected get subviewModule(): string | undefined {
    return this.referencesModel?.module;
  }

  @Widget.Reactive()
  protected get subviewModuleName(): string | undefined {
    return this.referencesModel?.moduleName;
  }

  @Widget.Reactive()
  protected get formData(): ActiveRecord {
    return this.parentActiveRecords?.[0] || {};
  }

  public initialize(props: Props) {
    super.initialize(props);
    const { rootHandle } = this;
    if (!rootHandle) {
      console.error('Invalid root handle. subview init error.');
      return this;
    }
    this.metadataSubviewWidget = this.createMetadataSubviewWidget(props);
    this.initSubview(props);
    return this;
  }

  protected createMetadataSubviewWidget(props: Props): MetadataViewWidget {
    let handle: string | undefined;
    const { rootRuntimeContext, field } = this;
    if (rootRuntimeContext && field) {
      handle = RuntimeContextManager.generatorFieldRuntimeContextHandle(rootRuntimeContext, field);
    }
    return this.createWidget(new MetadataViewWidget(handle), undefined, {
      metadataHandle: this.metadataHandle,
      rootHandle: this.rootHandle,
      automatic: true,
      internal: true,
      inline: true
    });
  }

  protected initSubview(props: Props): ReturnPromise<void> {
    const { currentViewDsl, metadataSubviewWidget } = this;
    let viewDsl = currentViewDsl;
    if (!viewDsl) {
      viewDsl = this.getViewDsl(props) as DslDefinition | undefined;
      this.currentViewDsl = viewDsl;
    }
    const runtimeSubview = this.generatorRuntimeSubview(props);
    this.runtimeSubviewContext = this.initRuntimeContext(metadataSubviewWidget, runtimeSubview as RuntimeView);
    this.initSubviewAfterProperties(props);
  }

  protected generatorRuntimeSubview(props: Props): ReturnPromise<RuntimeView> {
    return {
      type: this.subviewType,
      model: this.subviewModel,
      modelName: this.subviewModelName || '', // fixme @zbh 20221128 后端需补充modelName
      module: this.subviewModule, // fixme @zbh 20221128 后端需补充module
      moduleName: this.subviewModuleName, // fixme @zbh 20221128 后端需补充moduleName
      layout: this.getViewLayout(props) as DslDefinition | undefined,
      dsl: this.currentViewDsl,
      template: this.getViewTemplate(props) as DslDefinition | undefined
    };
  }

  protected getViewLayout(props: Props): ReturnPromise<DslDefinition | undefined> {
    return undefined;
  }

  protected getViewDsl(props: Props): ReturnPromise<DslDefinition | undefined> {
    const { template } = props;
    return template && this.findViewDslNode(template);
  }

  protected getViewTemplate(props: Props): ReturnPromise<DslDefinition | undefined> {
    return undefined;
  }

  protected initSubviewAfterProperties(props: Props) {}

  protected findViewDslNode(dsl: DslDefinition) {
    return dsl.widgets?.find((v) => v.dslNodeType === DslDefinitionType.VIEW);
  }

  protected initRuntimeContext(metadataSubviewWidget: MetadataViewWidget, view: RuntimeView): RuntimeContext {
    return metadataSubviewWidget.initContextByViewForField(view, this.field);
  }
}
