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
    ttype: ModelFieldType.Enum,
    widget: ['TableSwitch', 'EipTableSwitchEnum']
  })
)
export class TableEnumSwitchFieldWidget extends BaseTableFieldWidget<boolean> {
  /**
   * 为true的枚举值
   */
  @Widget.Reactive()
  private get truthyValue() {
    return this.getDsl().truthyValue;
  }

  /**
   * 为true的时候，执行的action
   */
  @Widget.Reactive()
  private get truthyAction() {
    return this.getDsl().truthyAction;
  }

  /**
   * 为false的枚举值
   */
  @Widget.Reactive()
  private get falsyValue() {
    return this.getDsl().falsyValue;
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
    const value = this.compute(context) === this.truthyValue;
    const tips = this.getDsl().tips;

    const express = this.getDsl().disabled;
    let disabled = false;
    if (express) {
      disabled = this.executeExpression(context.data, express, false) as boolean;
    }

    const execChange = (v) => {
      this.load(() => {
        const { modelActions } = this.model;
        const name = v ? this.truthyAction : this.falsyAction;
        const action = modelActions.find((a) => a.name === name) as RuntimeServerAction;
        if (action) {
          const val = v ? this.truthyValue : this.falsyValue;
          FunctionService.INSTANCE.simpleExecute(
            this.model,
            action.functionDefinition!,
            {
              requestFields: this.rootRuntimeContext.getRequestModelFields()
            },
            { ...context.data, [this.itemName]: val }
          );
          this.dataSource![context.index][this.itemName] = val;
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
                  disabled
                })
            }
          )
        ]
      )
    ];
  }
}
