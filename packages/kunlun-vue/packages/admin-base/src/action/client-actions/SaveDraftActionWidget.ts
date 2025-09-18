import { createVNode } from 'vue';
import { Entity, ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import {
  ActiveRecord,
  FunctionCache,
  FunctionService,
  RuntimeFunctionDefinition,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { CallChaining } from '@oinone/kunlun-shared';
import { OioNotification, OioButton, OioIcon, OioCloseIcon } from '@oinone/kunlun-vue-ui-antd';
import { Modal } from 'ant-design-vue';
import { ActionWidget } from '../component';
import { REFRESH_FORM_DATA } from '../../basic/constant';

/**
 * 草稿动作
 */
@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_SaveDraft
  })
)
export class SaveDraftAction extends ActionWidget {
  @Widget.Reactive()
  @Widget.Inject('mountedCallChaining')
  protected parentMountedCallChaining: CallChaining | undefined;

  @Widget.SubContext(REFRESH_FORM_DATA)
  protected reloadFormData$!: WidgetSubjection<boolean>;

  @Widget.Reactive()
  protected draftValue: ActiveRecord | undefined;

  /**
   * 草稿数据回填
   */
  @Widget.Method()
  protected useDraftValue() {
    this.reloadActiveRecords(this.draftValue);
    this.reloadDataSource(this.draftValue);
    this.reloadFormData$?.subject.next(true);
  }

  /**
   * 如果存在草稿数据，则提示用户是否使用草稿数据
   */
  protected showModalConfirm() {
    const _modal = Modal.confirm({
      class: 'oio-modal oio-draft-data-modal-confirm',
      icon: createVNode(OioIcon, { icon: 'oinone-tixing1', size: '18' }),
      closeIcon: createVNode(OioCloseIcon),
      title: translateValueByKey('是否加载草稿数据'),
      closable: true,
      content: () => {
        return createVNode(
          OioButton,
          {
            onClick: async () => {
              await this.deleteDraft();
              this.parentMountedCallChaining?.syncCall(true);
              _modal.destroy();
            },
            style: {
              position: 'absolute',
              bottom: 'var(--oio-margin-md)',
              right: '28%'
            }
          },
          translateValueByKey('清空草稿')
        );
      },
      okText: translateValueByKey('是'),

      cancelText: translateValueByKey('否'),
      onOk: () => {
        this.useDraftValue();
      },
      onCancel: () => {
        this.parentMountedCallChaining?.syncCall(true);
      }
    });
  }

  protected async created() {
    super.created();
    // 查询当前视图是否有草稿数据,如果存在，那么打开弹窗提示
    const rst = await this.queryDraft();

    if (rst) {
      this.draftValue = rst;
      this.showModalConfirm();
    } else {
      this.parentMountedCallChaining?.syncCall(true);
    }
  }

  /**
   * 查询草稿
   */
  protected async queryDraft() {
    return this.executeDraftOperator('queryDraft');
  }

  /**
   * 创建、修改草稿
   */
  protected async createOrUpdateDraft() {
    return this.executeDraftOperator('createOrUpdateDraft');
  }

  /**
   * 删除草稿
   */
  protected async deleteDraft() {
    return this.executeDraftOperator('deleteDraft');
  }

  /**
   * 执行草稿相关函数
   * @param {string} fun 函数名
   */
  protected async executeDraftOperator(fun: string) {
    const functionDefinition = await FunctionCache.get(this.model.model, fun);
    if (!functionDefinition) {
      console.error('无法获取可执行函数', this.action);
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('无法获取可执行函数'));
      return;
    }

    const requestFields = await this.getRequestModelFields();

    return FunctionService.INSTANCE.simpleExecute<Entity>(
      this.model,
      functionDefinition,
      {
        requestModels: FunctionService.usingStaticModels(),
        requestFields,
        variables: this.rootRuntimeContext.generatorVariables({ path: this.action.sessionPath })
      },
      this.activeRecords?.[0] || {}
    );
  }

  /**
   * 点击动作保存草稿
   */
  protected async clickAction(...args: unknown[]) {
    const rst = await this.createOrUpdateDraft();
    rst && OioNotification.success(translateValueByKey('提示'), translateValueByKey('保存成功'));

    return true;
  }
}
