import { FunctionService, RuntimeServerAction } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '@oinone/kunlun-vue-ui';
import { OioPopconfirm, OioSwitch, PopconfirmPlacement } from '@oinone/kunlun-vue-ui-antd';
import { Widget } from '@oinone/kunlun-vue-widget';

import { createVNode, VNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Boolean,
    widget: ['Switch', 'TableSwitch']
  })
)
export class TableBooleanSwitchFieldWidget extends BaseTableFieldWidget<boolean> {
  /**
   * 为true的时候，执行的action
   */
  @Widget.Reactive()
  private get truthyAction() {
    return this.getDsl().truthyAction;
  }

  /**
   * 为false的时候，执行的action
   */
  @Widget.Reactive()
  private get falsyAction() {
    return this.getDsl().falsyAction;
  }

  @Widget.Reactive()
  private visiblePopconfirm = false;

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] {
    const value = this.compute(context) === true;
    const tips = this.getDsl().tips;

    const express = this.getDsl().disabled;
    let disabled = false;
    if (express) {
      disabled = this.executeExpression(context.data, express, false) as boolean;
    }

    if (!disabled && !this.truthyAction && !this.falsyAction) {
      disabled = true;
    }

    const execChange = (v) => {
      this.load(() => {
        const { modelActions } = this.model;
        const name = v ? this.truthyAction : this.falsyAction;
        const action = modelActions.find((a) => a.name === name) as RuntimeServerAction;
        if (action) {
          FunctionService.INSTANCE.simpleExecute(
            this.model,
            action.functionDefinition!,
            {
              requestFields: this.rootRuntimeContext.getRequestModelFields()
            },
            { ...context.data, [this.itemName]: !!v }
          );
          this.dataSource![context.index][this.itemName] = !!v;
        }
      });
    };

    return [
      createVNode(
        'div',
        {
          style: {
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }
        },
        [
          createVNode(
            OioPopconfirm,
            {
              placement: PopconfirmPlacement.TR,
              condition: () => {
                return value;
              },
              confirmCallback: () => {
                execChange(!value);
              }
            },
            {
              title: tips,
              default: () =>
                createVNode(OioSwitch, {
                  checked: value,
                  disabled: disabled
                })
            }
          )
        ]
      )
    ];
  }
}
