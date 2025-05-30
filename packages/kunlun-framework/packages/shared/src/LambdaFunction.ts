export type Executor = () => void;

export type Consumer<T> = (t: T) => void;

export type Supplier<T> = () => T;

export type BiConverter<T, U, R> = (t: T, u: U) => R;

export type Converter<T, R> = (t: T) => R;

export type Comparator<T> = (a: T, b: T) => number;
