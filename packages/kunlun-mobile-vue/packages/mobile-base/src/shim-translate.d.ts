export {};

declare module 'vue' {
  interface ComponentCustomProperties {
    $translate<T extends string | null | undefined = string | null | undefined>(
      text: T,
      context?: Record<string, unknown>
    ): T;
  }
}
