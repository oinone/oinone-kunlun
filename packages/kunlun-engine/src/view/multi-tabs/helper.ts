import { generatorViewActionQueryParameter } from '../../action/helper';
import { MultiTabStackItem } from './typing';

export class MultiTabsHelper {
  // public static async fetchStackAction(stackItem: MultiTabStackItem): Promise<RuntimeViewAction> {
  //   let { action } = stackItem;
  //   if (!action) {
  //     action = await stackItem.fetchAction?.();
  //     if (!action) {
  //       throw new Error('Invalid stack action.');
  //     }
  //     stackItem.action = action;
  //     stackItem.model = action.model;
  //     stackItem.name = action.name;
  //   }
  //   return action;
  // }

  public static async generatorParameters(
    stackItem: MultiTabStackItem
  ): Promise<Record<string, string | null | undefined>> {
    let { parameters } = stackItem;
    if (!parameters) {
      const { action } = stackItem;
      parameters = (stackItem.generatorParameters || generatorViewActionQueryParameter)(action);
    }
    return parameters;
  }
}
