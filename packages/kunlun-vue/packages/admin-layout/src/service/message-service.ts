import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { gql } from '@oinone/kunlun-request';
import { http } from '@oinone/kunlun-service';

export interface PamirsMessage {
  id: string;
  messageType: string;
  createDate: string;
  message: { body: string; id: string; resId: string; workFlowTaskType: string };
}

export class MessageService {
  public static async unreadWorkflowList() {
    const body = gql`
      {
        unreadMessageQuery {
          unreadWorkflowList(data: {}) {
            id
            messageType
            createDate
            message {
              body
              name
              extendIcon
              id
              resId
              workFlowTaskType
              messageType
            }
          }
        }
      }
    `;
    const result = await http.query<PamirsMessage[]>(SYSTEM_MODULE_NAME.MESSAGE, body);
    return result.data.unreadMessageQuery.unreadWorkflowList;
  }

  public static async readWorkflowMessage(id: string) {
    const query = gql`
      {
        unreadMessageQuery {
          readWorkflowMessage(data: { id: ${id} }) {
            id
            messageType
            createDate
          }
        }
      }
    `;
    const result = await http.query(SYSTEM_MODULE_NAME.MESSAGE, query);
    return result.data.unreadMessageQuery.readWorkflowMessage;
  }

  public static async unreadCount() {
    const body = gql`
      {
        unreadMessageQuery {
          unreadCount(data: {})
        }
      }
    `;
    const result = await http.query<number>(SYSTEM_MODULE_NAME.MESSAGE, body);
    return result.data.unreadMessageQuery.unreadCount;
  }
}
