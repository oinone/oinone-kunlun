import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import {
  IResourceDateTimeFormat,
  RedirectTargetEnum,
  executeViewAction,
  queryResourceDateTimeFormat
} from '@kunlun/engine';
import { getModel } from '@kunlun/service';
import {
  CastHelper,
  DateUtil,
  defaultDateFormatKey,
  defaultFormat,
  defaultTimeFormatKey,
  ObjectUtils
} from '@kunlun/shared';
import { isDev } from '@kunlun/router';
import { MaskWidget } from '../../basic';
import { MessageService, PamirsMessage } from '../../service';
import DefaultNotification from './DefaultNotification.vue';

type ReturnBeforeClick = (message, messageInfo) => Promise<Boolean | null | undefined>;

enum BeforeClickMapName {
  wait = 'wait',
  copy = 'copy',
  write = 'write',
  mail = 'mail'
}

type BeforeClickMapKey = keyof typeof BeforeClickMapName;

export enum NotificationTypeEnum {
  WORKFLOW = 'WORKFLOW',
  NOTIFICATION = 'NOTIFICATION',
  COPY = 'COPY'
}

@SPI.ClassFactory(MaskWidget.Token({ widget: 'notification' }))
export class NotificationWidget extends MaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultNotification);
    return this;
  }

  public async getCopyAction() {
    return {
      name: 'workflow_detail',
      title: '查看工作流用户任务待办',
      displayName: '查看',
      actionType: 'VIEW',
      target: 'ROUTER',
      viewType: 'DETAIL',
      contextType: 'SINGLE',
      bindingType: ['TABLE'],
      model: 'workbench.WorkBenchWorkflowUserTaskCopy',
      resModel: 'workbench.WorkBenchWorkflowUserTaskCopy',
      moduleName: 'workflow',
      resModule: 'workflow',
      resModuleName: 'workflow',
      priority: 100,
      sessionPath: '/workflow/WorkflowMenus_WorkBenchMenu_CopyUserTaskMenu'
    };
  }

  public async getWaitAction() {
    return {
      name: 'workflow_wait',
      title: '审批工作流用户任务待办',
      displayName: '审批',
      actionType: 'VIEW',
      target: 'ROUTER',
      viewType: 'FORM',
      contextType: 'SINGLE',
      bindingType: ['TABLE'],
      model: 'workbench.WorkBenchWorkflowUserTaskActive',
      resModel: 'workbench.WorkBenchWorkflowUserTaskActive',
      invisible: "!(activeRecord.taskType == 'APPROVE' && activeRecord.status == 'ACTIVE')",
      moduleName: 'workflow',
      resModule: 'workflow',
      resModuleName: 'workflow',
      priority: 100,
      sessionPath: '/workflow/WorkflowMenus_WorkBenchMenu_ActiveUserTaskMenu'
    };
  }

  public async getWriteAction() {
    return {
      name: 'workflow_write',
      title: '填写工作流用户任务待办',
      displayName: '填写',
      actionType: 'VIEW',
      target: 'ROUTER',
      viewType: 'FORM',
      contextType: 'SINGLE',
      bindingType: ['TABLE'],
      model: 'workbench.WorkBenchWorkflowUserTaskActive',
      resModel: 'workbench.WorkBenchWorkflowUserTaskActive',
      invisible: "!(activeRecord.taskType == 'WRITE' && activeRecord.status == 'ACTIVE')",
      moduleName: 'workflow',
      resModule: 'workflow',
      resModuleName: 'workflow',
      priority: 100,
      sessionPath: '/workflow/WorkflowMenus_WorkBenchMenu_ActiveUserTaskMenu'
    };
  }

  private beforeClickMap = {
    [BeforeClickMapName.wait]: async (message, messageInfo) => {
      return true;
    },

    [BeforeClickMapName.copy]: async (message, messageInfo) => {
      return true;
    },

    [BeforeClickMapName.write]: async (message, messageInfo) => {
      return true;
    },

    [BeforeClickMapName.mail]: async (message, messageInfo) => {
      return true;
    }
  };

  public async beforeClick(key: Partial<Record<BeforeClickMapKey, ReturnBeforeClick>>);
  public async beforeClick(key: BeforeClickMapKey, cb: ReturnBeforeClick);
  public async beforeClick(
    args: BeforeClickMapKey | Partial<Record<BeforeClickMapKey, ReturnBeforeClick>>,
    cb?: ReturnBeforeClick
  ) {
    if (typeof args === 'string') {
      this.beforeClickMap[args as any] = cb;
    } else {
      Object.entries(args).forEach(([key, val]) => {
        this.beforeClickMap[key as any] = val;
      });
    }
  }

  @Widget.Reactive()
  public messageTextMap = {
    WORKFLOW: {
      title: '工作流',
      desc: '待处理的审批/填写任务',
      btn: '去处理',
      icon: 'oinone-tianxie',
      color: 'rgb(122, 32, 233)'
    },
    NOTIFICATION: {
      title: '站内信',
      desc: '未读的站内信',
      btn: '去查看',
      icon: 'oinone-xitongtongzhi'
    },
    COPY: {
      title: '抄送',
      desc: '未查看的抄送',
      btn: '去查看',
      icon: 'oinone-tianxie'
    }
  };

  @Widget.Reactive()
  public messageType = NotificationTypeEnum.WORKFLOW;

  @Widget.Reactive()
  public get messageInfo() {
    return this.messageTextMap[this.messageType];
  }

  @Widget.Reactive()
  public confirmModalTitle = '查看消息';

  @Widget.Reactive()
  public currentMessage = {} as any;

  @Widget.Reactive()
  public isShowConfirmModal = false;

  @Widget.Reactive()
  public currentMessageId = '';

  @Widget.Method()
  public changeMessageType(type: NotificationTypeEnum) {
    this.messageType = type;
  }

  @Widget.Method()
  public toggleDialog() {
    this.isShowConfirmModal = !this.isShowConfirmModal;
  }

  @Widget.Method()
  public async onWorkflowUserTask() {
    const model = await getModel('workflow.WorkflowUserTask');
    const action = model.viewActionList?.find((a) => a.name === 'workflow#任务待办');
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    action &&
      executeViewAction(CastHelper.cast(action), undefined, undefined, {
        module: action.moduleName
      });
  }

  @Widget.Method()
  public async onDetail(message, messageInfo) {
    if (messageInfo.messageType === 'WORKFLOW' || messageInfo.messageType === 'COPY') {
      let action;

      if (message.workFlowTaskType === '审批') {
        const rst = await this.beforeClickMap['wait'](message, messageInfo);

        if (!rst) {
          return;
        }

        action = await this.getWaitAction();
      } else {
        const rst = await this.beforeClickMap['write'](message, messageInfo);

        if (!rst) {
          return;
        }
        action = await this.getWriteAction();
      }

      if (message.messageType === 'COPY') {
        const rst = await this.beforeClickMap['copy'](message, messageInfo);

        if (!rst) {
          return;
        }
        action = await this.getCopyAction();
      }

      if (action) {
        executeViewAction(
          action,
          undefined,
          undefined,
          {
            id: message.resId,
            module: action.resModuleName || action.moduleName
          },
          RedirectTargetEnum.BLANK
        );
      }
    } else {
      const rst = await this.beforeClickMap['mail'](message, messageInfo);

      if (!rst) {
        return;
      }
      this.currentMessage = message;
      this.currentMessageId = messageInfo.id;
      this.isShowConfirmModal = true;
    }
  }

  @Widget.Method()
  protected formatDateTime(value: string) {
    if (!value) {
      return value;
    }

    const dateFormat = defaultDateFormatKey;
    const timeFormat = defaultTimeFormatKey;

    const resourceDateFormat = ObjectUtils.toUpperSnakeCase(
      this.resourceDateTimeFormat.resourceDateFormat as unknown as Record<string, string>
    );
    const resourceTimeFormat = ObjectUtils.toUpperSnakeCase(
      this.resourceDateTimeFormat.resourceTimeFormat as unknown as Record<string, string>
    );

    const format = [resourceDateFormat[dateFormat!], resourceTimeFormat[timeFormat!]].filter(Boolean).join(' ');
    return DateUtil.dateFormat(DateUtil.toDate(value, defaultFormat), format);
  }

  @Widget.Reactive()
  protected msgTotal = 0;

  @Widget.Reactive()
  protected resourceDateTimeFormat = {} as IResourceDateTimeFormat;

  protected async getMsgTotal() {
    this.msgTotal = await MessageService.unreadCount();
  }

  @Widget.Reactive()
  protected messageList = [] as PamirsMessage[];

  @Widget.Method()
  protected async getMessageInfo() {
    this.messageList = await MessageService.unreadWorkflowList();
  }

  @Widget.Method()
  protected readMessage(msgId: string) {
    return MessageService.readWorkflowMessage(msgId);
  }

  protected msgTimer;

  /**
   * 轮询间隔时间，单位: 秒
   * @protected
   */
  protected msgDelay = 5000;

  protected async $$created() {
    super.$$created();
    this.resourceDateTimeFormat = await queryResourceDateTimeFormat();
  }

  protected mounted() {
    super.mounted();
    this.getMsgTotal();
    if (!isDev()) {
      this.msgTimer = setInterval(() => {
        this.getMsgTotal();
      }, this.msgDelay || 5000);
    }
  }

  protected beforeUnmount() {
    this.msgTimer && clearInterval(this.msgTimer);
    super.beforeUnmount();
  }
}
