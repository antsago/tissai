export const NonMatch: unique symbol = Symbol("Rule did not match")

export type IsMatch<T> = Exclude<T, typeof NonMatch>
export type AwaitedMatch<T> = IsMatch<Awaited<T>>
