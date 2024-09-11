export const runForAllPages = async <T>(
  pages: AsyncGenerator<T, void, unknown>,
  onPage: (page: T, index: number) => Promise<void>,
  onError: (error: unknown, page: T) => void,
) => {
  let index = 1
  for await (let page of pages) {
    try {
      await onPage(page, index)
      index += 1
    } catch (error) {
      onError(error, page)
    }
  }

  return index
}
