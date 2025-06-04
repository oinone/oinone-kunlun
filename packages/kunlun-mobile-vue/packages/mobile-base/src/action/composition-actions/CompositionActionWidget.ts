import { DslDefinitionType } from '@oinone/kunlun-dsl';
import { ActionType } from '@oinone/kunlun-meta';
import { Router, useMatched } from '@oinone/kunlun-router';
import { SPI } from '@oinone/kunlun-spi';
import { isBoolean } from 'lodash-es';
import { ActionWidgetProps, createActionWidget } from '../../tags/resolve/internal';
import { ActionWidget } from '../component';
import { RouterViewActionWidget } from '../view-actions';
import CompositionAction from './CompositionAction.vue';

@SPI.ClassFactory(ActionWidget.Token({ actionType: ActionType.Composition }))
export class CompositionActionWidget extends ActionWidget {
  protected childrenActions: ActionWidget[] = [];

  public initialize(props) {
    super.initialize(props);
    this.setComponent(CompositionAction);
    this.template?.widgets?.forEach((dsl) => {
      if (dsl.dslNodeType === DslDefinitionType.ACTION) {
        const widgetResult = createActionWidget({
          ...dsl,
          template: dsl,
          metadataHandle: this.metadataHandle,
          rootHandle: this.rootHandle,
          parentHandle: this.currentHandle
        } as ActionWidgetProps);
        if (widgetResult) {
          this.childrenActions.push(widgetResult.widget as ActionWidget);
        }
      }
    });
    return this;
  }

  public async clickAction() {
    const next = async (index: number) => {
      const action = this.childrenActions[index];
      if (action) {
        /**
         * 如果当前的action是 `RouterViewActionWidget`,
         * 就需要设置`RouterViewActionWidget`的router跟matched
         */
        if (action instanceof RouterViewActionWidget) {
          const { matched } = useMatched();
          action.router = this.$router as Router;
          action.matched = matched;
        }
        const res = await action.click();
        if (isBoolean(res) && !res) {
          return res;
        }
        return next(index + 1);
      }
    };
    return next(0);
  }
}
