/* eslint-disable import/export */
type Func<A, B> = (next: A) => B

export function compose<A, B>(f0: Func<A, B>): (ctx: A) => B
export function compose<A, B, C>(f1: Func<B, C>, f0: Func<A, B>): (ctx: A) => C
export function compose<A, B, C, D>(
  f2: Func<C, D>,
  f1: Func<B, C>,
  f0: Func<A, B>,
): (ctx: A) => D
export function compose<A, B, C, D, E>(
  f3: Func<D, E>,
  f2: Func<C, D>,
  f1: Func<B, C>,
  f0: Func<A, B>,
): (ctx: A) => E
export function compose<A, B, C, D, E, F>(
  f4: Func<E, F>,
  f3: Func<D, E>,
  f2: Func<C, D>,
  f1: Func<B, C>,
  f0: Func<A, B>,
): (ctx: A) => F
// eslint-disable-next-line
export function compose(...funcs: Func<any, any>[]) {
  return (arg: any) => funcs.reduceRight((composed, f) => f(composed), arg) // eslint-disable-line
}
