import { cloneDeep } from 'lodash-es';
import { RuntimeContext } from '../runtime-context';

export default function transfer(this: RuntimeContext, target: RuntimeContext, clone = true) {
  if (clone) {
    target.viewAction = cloneDeep(this.viewAction);
    target.field = cloneDeep(this.field);
    target.module = cloneDeep(this.module);
    target.model = cloneDeep(this.model);
    target.view = cloneDeep(this.view);
    target.viewLayout = cloneDeep(this.viewLayout);
    target.viewDsl = cloneDeep(this.viewDsl);
    target.viewTemplate = cloneDeep(this.viewTemplate);
    target.extendData = cloneDeep(this.extendData);
  } else {
    target.viewAction = this.viewAction;
    target.field = this.field;
    target.module = this.module;
    target.model = this.model;
    target.view = this.view;
    target.viewLayout = this.viewLayout;
    target.viewDsl = this.viewDsl;
    target.viewTemplate = this.viewTemplate;
    target.extendData = this.extendData;
  }
}
