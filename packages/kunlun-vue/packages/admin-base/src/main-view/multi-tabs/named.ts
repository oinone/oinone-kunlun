export class MultiTabNamedHelper {
  private static readonly prefix = 'MultiTabContainerWidget';

  private static counter = 0;

  public static generatorNamed() {
    return `${MultiTabNamedHelper.prefix}${MultiTabNamedHelper.counter++}`;
  }
}

export const MULTI_TABS_TELEPORT_HANDLE = '__multi_tabs_teleport_container__';

export const MULTI_TABS_CONTAINER_HANDLE = '__multi_tabs_container__';
