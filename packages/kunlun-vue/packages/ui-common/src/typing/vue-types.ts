import type { Ref } from 'vue';

export type UnrefType<T> = T | Ref<T>;
