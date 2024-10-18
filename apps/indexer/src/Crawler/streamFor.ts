export const streamFor = async <T>(
  stream: AsyncGenerator<T, void, unknown>,
  onItem: (current: T, index: number) => Promise<void>,
  onError: (error: unknown, current: T) => void,
) => {
  let index = 1
  let sucessfull = 0
  for await (let item of stream) {
    try {
      await onItem(item, index)
      sucessfull += 1
    } catch (error) {
      onError(error, item)
    } finally {
      index += 1
    }
  }

  return sucessfull
}
