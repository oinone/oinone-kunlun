import { Consumer, Converter, Supplier } from './LambdaFunction';
import { NonNullable, Nullable, PredictNullable } from './typing';

export class Optional<T> {
  private static EMPTY = new Optional<unknown>();

  private readonly value?: T;

  private constructor(value?: T) {
    this.value = value;
  }

  public static ofNullable<T>(value: T): Optional<T> {
    return new Optional<T>(value);
  }

  public static empty<T>(): Optional<T> {
    return Optional.EMPTY as Optional<T>;
  }

  public map<R>(mapper: Converter<NonNullable<T>, R>): Optional<R> {
    const { value } = this;
    if (value == null) {
      return Optional.empty();
    }
    return Optional.ofNullable(mapper(value!));
  }

  public predict<R extends NonNullable<T>>(predicate: (value: NonNullable<T>) => value is R): Optional<R> {
    return this.filter(predicate);
  }

  public filter<R = T>(predicate: Converter<NonNullable<T>, boolean>): Optional<R> {
    const { value } = this;
    if (value == null) {
      return this as unknown as Optional<R>;
    }
    return predicate(value!) ? (this as unknown as Optional<R>) : (Optional.EMPTY as Optional<R>);
  }

  public orElse<R extends Nullable<T>>(other: R): PredictNullable<T, R> {
    const { value } = this;
    if (value == null) {
      return other as unknown as PredictNullable<T, R>;
    }
    return value as unknown as PredictNullable<T, R>;
  }

  public orElseGet<R extends Nullable<T>>(other: Supplier<R>): PredictNullable<T, R> {
    const { value } = this;
    if (value == null) {
      return other() as unknown as PredictNullable<T, R>;
    }
    return value as unknown as PredictNullable<T, R>;
  }

  public orElseThrow<E extends Error>(exceptionSupplier: Supplier<E>): NonNullable<T> {
    const { value } = this;
    if (value == null) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw exceptionSupplier();
    }
    return value!;
  }

  public ifPresent(consumer: Consumer<NonNullable<T>>) {
    const { value } = this;
    if (value != null) {
      consumer(value!);
    }
  }
}
