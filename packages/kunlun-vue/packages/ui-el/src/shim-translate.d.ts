export {};

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $translate<T extends string | null | undefined = string | null | undefined>(text: T): T;
  }
}
