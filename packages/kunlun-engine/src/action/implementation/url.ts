import { IURLAction, ViewActionTarget } from '@kunlun/meta';
import { RedirectTargetEnum } from '../typing';

const executeUrlAction = (action: IURLAction) => {
  const { url } = action;
  switch (action.target) {
    case ViewActionTarget.Router:
      window.open(url, RedirectTargetEnum.SELF);
      break;
    case ViewActionTarget.Dialog:
    case ViewActionTarget.OpenWindow:
    case ViewActionTarget.Frame:
      window.open(url, RedirectTargetEnum.BLANK);
      break;
    default:
      throw new Error(`Invalid target type. value = ${action.target}`);
  }
};

export { executeUrlAction };
