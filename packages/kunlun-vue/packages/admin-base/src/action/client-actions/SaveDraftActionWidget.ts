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
import { useDraftDataOperator } from '../../util';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_SaveDraft
  })
)
export class SaveDraftAction extends ActionWidget {
  @Widget.Reactive()
  protected get viewDraftDataIdentifier() {
    const pk = this.model.pks?.[0] || 'id';
    const value = this.initialValue?.[0]?.[pk] || this.initialContext?.[pk] || this.urlParameters?.id;

    return `${this.viewAction?.name || ''}-${this.viewAction?.resViewName || ''}-${value || ''}`;
  }

  @Widget.Reactive()
  @Widget.Inject('mountedCallChaining')
  protected parentMountedCallChaining: CallChaining | undefined;

  @Widget.SubContext(REFRESH_FORM_DATA)
  protected reloadFormData$!: WidgetSubjection<boolean>;

  @Widget.Reactive()
  protected draftValue: ActiveRecord | undefined;

  private draftDataOperator!: ReturnType<typeof useDraftDataOperator>;

  /**
   * 草稿数据回填
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
              await this.draftDataOperator.deleteDraft();
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
    this.draftDataOperator = useDraftDataOperator(this.viewDraftDataIdentifier);

    // 查询当前视图是否有草稿数据,如果存在，那么打开弹窗提示
    const rst = await this.draftDataOperator.queryDraft();

    if (rst?.hasDraft) {
      this.draftValue = JSON.parse(rst.draftContent || '{}');
      this.showModalConfirm();
    } else {
      this.parentMountedCallChaining?.syncCall(true);
    }
  }

  protected async clickAction(...args: unknown[]) {
    const record = this.activeRecords?.[0];

    await this.draftDataOperator.createOrUpdateDraft(record);

    OioNotification.success(translateValueByKey('提示'), translateValueByKey('保存成功'));

    return true;
  }
}
