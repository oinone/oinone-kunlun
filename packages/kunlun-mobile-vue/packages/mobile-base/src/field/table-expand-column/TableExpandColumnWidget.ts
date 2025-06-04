import { DslDefinition, DslDefinitionHelper, DslSlotUtils, ViewDslDefinition } from '@oinone/kunlun-dsl';
import {
  ActiveRecord,
  ActiveRecords,
  createDefaultLayout,
  getRealTtype,
  isRelationField,
  ModelCache,
  RuntimeModel,
  RuntimeRelationField
} from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { CallChaining, Optional, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '../../ui';
import { DslRender, Widget } from '@oinone/kunlun-vue-widget';
import { cloneDeep } from 'lodash-es';
import { VNode } from 'vue';
import { BaseElementWidget, BaseTableColumnWidget } from '../../basic';

export interface ExpandColumnLoadedData {
  dataSource?: ActiveRecords | null;
  activeRecords?: ActiveRecords;
}

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: ['expand-column', 'ExpandColumn', 'expandColumn']
  })
)
export class TableExpandColumnWidget extends BaseTableColumnWidget {
  protected defaultAllInvisible = true;

  protected mountedCallChainingMap = new Map<string, CallChaining>();

  protected refreshCallChainingMap = new Map<string, CallChaining>();

  /**
   * 重置挂载钩子
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected mountedCallChaining: CallChaining | undefined;

  /**
   * 重置刷新时钩子
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected refreshCallChaining: CallChaining | undefined;

  /**
   * 重置数据源
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get dataSource() {
    return undefined;
  }

  @Widget.Reactive()
  @Widget.Inject('refreshCallChaining')
  protected parentRefreshCallChaining: CallChaining | undefined;

  public initialize(props) {
    super.initialize(props);
    let expandViewDslNode = this.template?.widgets?.find((v) => DslDefinitionHelper.isView(v)) as ViewDslDefinition;
    if (!expandViewDslNode) {
      const modelFields = this.rootRuntimeContext.model?.modelFields;
      if (modelFields) {
        for (const modelField of modelFields) {
          expandViewDslNode = modelField.template?.widgets?.find((v) =>
            DslDefinitionHelper.isView(v)
          ) as ViewDslDefinition;
          if (expandViewDslNode && isRelationField(modelField)) {
            this.setExpandField(modelField);
            break;
          }
        }
      }
    }
    if (expandViewDslNode) {
      let { type: viewType } = expandViewDslNode;
      if (!viewType) {
        viewType = ViewType.Form;
      }
      const layout = createDefaultLayout(viewType, false);
      if (layout) {
        this.setExpandDslDefinition(DslSlotUtils.mergeTemplateToLayout(layout, expandViewDslNode));
      } else {
        this.setExpandDslDefinition(expandViewDslNode);
      }
    }
    return this;
  }

  @Widget.Reactive()
  protected expandDslDefinition: DslDefinition | undefined;

  public getExpandDslDefinition(context?: RowContext): DslDefinition | undefined {
    return this.expandDslDefinition;
  }

  public setExpandDslDefinition(expandDslDefinition: DslDefinition | undefined) {
    this.expandDslDefinition = expandDslDefinition;
  }

  @Widget.Reactive()
  protected expandModel: RuntimeModel | undefined;

  public getExpandModel(): RuntimeModel {
    return this.expandModel || this.model;
  }

  public setExpandModel(expandModel: RuntimeModel | undefined) {
    this.expandModel = expandModel;
  }

  @Widget.Reactive()
  protected expandField: RuntimeRelationField | undefined;

  public getExpandField(): RuntimeRelationField | undefined {
    return this.expandField;
  }

  public setExpandField(expandField: RuntimeRelationField | undefined) {
    this.expandField = expandField;
  }

  @Widget.Reactive()
  public get columnType() {
    return 'expand';
  }

  @Widget.Reactive()
  public get width() {
    return super.width || 52;
  }

  @Widget.Reactive()
  public get minWidth() {
    return super.minWidth || 52;
  }

  @Widget.Reactive()
  public get align() {
    return super.align || 'center';
  }

  @Widget.Reactive()
  public get fixed() {
    return Optional.ofNullable(super.fixed).orElse('left');
  }

  @Widget.Reactive()
  public get invisible() {
    const invisible = super.invisible;
    if (invisible) {
      return true;
    }
    return !this.getExpandDslDefinition();
  }

  protected $$mounted() {
    super.$$mounted();
    const expandModel = this.getExpandField()?.referencesModel;
    if (expandModel) {
      this.setExpandModel(expandModel);
    } else {
      const model = this.getExpandField()?.references;
      if (model) {
        ModelCache.get(model).then((result) => {
          this.setExpandModel(result);
        });
      } else {
        this.setExpandModel(this.model);
      }
    }
  }

  protected getFilter(context: RowContext) {
    let expendFilter: string | undefined;
    const expandModel = this.getExpandModel();
    const expandField = this.getExpandField();
    const { data } = context;
    if (expandField) {
      const { data: field, relationFields, referenceFields } = expandField;
      const realTtype = getRealTtype(expandField);
      if (
        realTtype &&
        relationFields?.length &&
        referenceFields?.length &&
        relationFields.length === referenceFields.length
      ) {
        switch (realTtype) {
          case ModelFieldType.OneToOne:
          case ModelFieldType.ManyToOne: {
            const relationData = data[field] as ActiveRecord;
            if (relationData) {
              expendFilter = referenceFields
                .map((referenceField) => `${referenceField} == ${relationData[referenceField]}`)
                .join(' and ');
            } else {
              expendFilter = '';
            }
            break;
          }
          case ModelFieldType.OneToMany: {
            let expandFilterItems: string[] = [];
            for (let i = 0; i < relationFields.length; i++) {
              const relationField = relationFields[i];
              const referenceField = referenceFields[i];
              const referenceValue = data[relationField];
              if (referenceValue == null) {
                expandFilterItems = [];
                break;
              } else {
                expandFilterItems.push(`${referenceField} == ${data[relationField]}`);
              }
            }
            expendFilter = expandFilterItems.join(' and ');
            break;
          }
          case ModelFieldType.ManyToMany:
            expendFilter = '';
            break;
        }
      }
    } else if (expandModel) {
      expendFilter = expandModel.pks?.map((pk) => `${pk} == ${data[pk]}`).join(' and ');
    }
    const { filter } = this.getExpandDslDefinition(context)!;
    if (!filter) {
      return expendFilter;
    }
    return `${expendFilter} and (${filter})`;
  }

  protected loadData(context: RowContext): ExpandColumnLoadedData {
    return {
      dataSource: null,
      activeRecords: cloneDeep(context.data)
    };
  }

  @Widget.Method()
  public renderContentSlot(context: RowContext): VNode[] | string {
    const dslDefinition = this.getExpandDslDefinition(context);
    if (this.invisible || !dslDefinition) {
      return [];
    }
    const vnode = DslRender.render({
      ...dslDefinition,
      ...this.loadData(context),
      metadataHandle: this.metadataHandle,
      rootHandle: this.rootHandle,
      parentHandle: this.currentHandle,
      class: StringHelper.append(['table-expand-panel'], dslDefinition.class),
      model: this.getExpandModel().model,
      modelName: this.getExpandModel().name,
      module: this.getExpandModel().module,
      moduleName: this.getExpandModel().moduleName,
      filter: this.getFilter(context),
      inline: true,
      mountedCallChaining: this.createOrGetterCallChaining(this.mountedCallChainingMap, context.key),
      refreshCallChaining: this.createOrGetterCallChaining(this.refreshCallChainingMap, context.key)
    });
    if (!vnode) {
      return [];
    }
    return [vnode];
  }

  protected createOrGetterCallChaining(map: Map<string, CallChaining>, key: string): CallChaining {
    let callChaining = map.get(key);
    if (!callChaining) {
      callChaining = new CallChaining();
      map.set(key, callChaining);
    }
    return callChaining;
  }
}
