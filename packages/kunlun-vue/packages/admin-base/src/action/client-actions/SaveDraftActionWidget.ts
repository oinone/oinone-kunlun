import { createVNode } from 'vue';
import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { ActiveRecord, GenericFunctionService, translateValueByKey } from '@oinone/kunlun-engine';
import { CallChaining } from '@oinone/kunlun-shared';
import { OioNotification, OioButton, OioIcon, OioCloseIcon } from '@oinone/kunlun-vue-ui-antd';
import { Modal } from 'ant-design-vue';
import { ActionWidget } from '../component';
import { REFRESH_FORM_DATA } from '../../basic/constant';

interface DraftValueRecord {
  hasDraft: boolean;
  draftContent: string;
}

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
   * 删除草稿
   */
  @Widget.Method()
  protected useDraftValue() {
    this.reloadActiveRecords(this.draftValue);
    this.reloadDataSource(this.draftValue);
    this.reloadFormData$?.subject.next(true);
  }

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
    // 查询当前视图是否有草稿数据,如果存在，那么打开弹窗提示
    const rst = await GenericFunctionService.INSTANCE.simpleExecuteByFun<DraftValueRecord>(
      this.draftModelModal,
      'queryDraft',
      this.viewDraftDataIdentifier
    );

    if (rst?.hasDraft) {
      this.draftValue = JSON.parse(rst.draftContent || '{}');
      this.showModalConfirm();
    } else {
      this.parentMountedCallChaining?.syncCall(true);
    }
  }

  protected async clickAction(...args: unknown[]) {
    const record = this.activeRecords?.[0];

    await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.draftModelModal, 'createOrUpdateDraft', {
      viewIdentifier: this.viewDraftDataIdentifier,
      draftContent: JSON.stringify(record || {})
    });

    OioNotification.success(translateValueByKey('提示'), translateValueByKey('保存成功'));

    return true;
  }
}
