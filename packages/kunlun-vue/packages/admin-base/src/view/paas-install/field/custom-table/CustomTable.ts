import {
  Dialog,
  executeServerAction,
  executeViewAction,
  translateValueByKey,
  ViewActionCache
} from '@oinone/kunlun-engine';
import { ActionType, IModel, ModelFieldType, ViewActionTarget, ViewType } from '@oinone/kunlun-meta';
import { customMutation, getModel } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormO2MTableFieldWidget } from '../../../../field';
import { createRuntimeContextForWidget } from '../../../../tags';
import { FormWidget } from '../../../form';
import CodeFocusTable from './CodeFoucsTable.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: ModelFieldType.OneToMany,
    widget: ['CodeFuseTable']
  })
)
export class CodeFuseTable extends FormO2MTableFieldWidget {
  private dialogViewAction: FormWidget | undefined;

  public initialize(props: Record<string, unknown>) {
    super.initialize(props);
    this.setComponent(CodeFocusTable);
    return this;
  }

  @Widget.Reactive()
  private extraLabel = '';

  @Widget.Reactive()
  private extraField = {};

  @Widget.Reactive()
  private extraFieldValue = '';

  @Widget.Reactive()
  private extraAction: any[] = [];

  private getActionByModel(model: IModel, actionName: string): any {
    const actions = [
      ...(model.viewActionList || []),
      ...(model.urlActionList || []),
      ...(model.serverActionList || [])
    ];
    return actions.find((action) => action.name === actionName);
  }

  @Widget.Reactive()
  private async executeAction(actionName, actionTip) {
    const model = await getModel(this.field.model);
    const action = this.getActionByModel(model, actionName);
    const item = { ...this.formData };

    if (this.dialogViewAction) {
      this.dialogViewAction?.dispose();
    }
    if (action) {
      if (action.target === ViewActionTarget.Dialog) {
        const viewAction = await ViewActionCache.get(model.model, actionName)!;
        const resView = viewAction?.resView;
        if (resView) {
          const runtimeContext = createRuntimeContextForWidget(resView, { mergeLayout: true });
          const runtimeContextHandle = runtimeContext.handle;
          const dialogWidget = Dialog.create();
          dialogWidget.on('ok', async () => {
            await this.load(async () => {
              let result;
              dialogWidget.onVisibleChange(false);
              const param = this.dialogViewAction?.activeRecords?.[0]!;
              // 上传jar包
              if (actionName === 'uploadJarView') {
                result = await customMutation('paas.codeFuse.CodeFuseModuleExtProject', 'uploadJar', param);
              }
              // 创建分支
              if (actionName === 'buildGitBranchView') {
                result = await customMutation('paas.codeFuse.CodeFuseModuleExtProject', 'buildGitBranch', param);
              }
              if (result) {
                this.parentRefreshProcess && (await this.parentRefreshProcess());
                this.refreshParentProcess();
              }
              return result;
            });
          });
          dialogWidget.on('cancel', () => {
            // do something for click cancel.
            dialogWidget.onVisibleChange(false);
          });

          this.dialogViewAction = dialogWidget.createWidget(FormWidget, undefined, {
            metadataHandle: runtimeContextHandle,
            rootHandle: runtimeContextHandle,
            template: runtimeContext.viewTemplate,
            internal: true,
            inline: true,
            dataSource: item,
            activeRecords: item
          });
          dialogWidget.setTitle(resView.title!);
          dialogWidget.onVisibleChange(true);
          return;
        }
        return;
      }
      if (action.actionType === ActionType.View) {
        return executeViewAction(action, null, null, { id: item.id });
      }
      //
      if (action.actionType === ActionType.Server) {
        this.loading = true;
        try {
          OioNotification.info(
            '',
            `${translateValueByKey('正在')}${actionTip}, ${translateValueByKey('请稍后，请勿重复操作')}`
          );
          await executeServerAction(action, item);
          OioNotification.success('', `${actionTip}${translateValueByKey('成功')}`);
          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      } else {
        console.error('跳转异常');
      }
    }
  }

  @Widget.Watch('formData', { immediate: true, deep: true })
  public async getExtraConfig() {
    const { extraLabel, extraField, extraAction } = this.getDsl();
    const model = await getModel(this.field.model);
    if (extraLabel) {
      this.extraLabel = extraLabel;
    }

    if (extraField) {
      const field = model.modelFields.find((f) => f.name === extraField);
      if (field) {
        this.extraFieldValue = this.formData[field!.name] as string;
        this.extraField = field!;
      }
    }

    if (extraAction) {
      const field = model.modelFields.find((f) => f.name === extraAction);
      this.extraAction = this.formData[field!.name] as any;
    }
  }

  public async mounted() {
    super.mounted();
    this.getExtraConfig();
  }
}
