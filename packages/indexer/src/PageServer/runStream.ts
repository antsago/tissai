export const runStream = async <T>(
  stream: AsyncGenerator<T, void, unknown>,
  onItem: (current: T, index: number) => Promise<void>,
  onError: (error: unknown, current: T) => void,
) => {
  let index = 1
  for await (let item of stream) {
    try {
      await onItem(item, index)
      index += 1
    } catch (error) {
      onError(error, item)
    }
  }

  return index
}
