export {};

declare module 'vue' {
  interface ComponentCustomProperties {
    $translate(text: string, context?: Record<string, unknown>): string;
  }
}
