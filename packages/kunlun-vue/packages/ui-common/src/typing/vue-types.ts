import { Ref } from 'vue';

export type UnrefType<T> = T | Ref<T>;
