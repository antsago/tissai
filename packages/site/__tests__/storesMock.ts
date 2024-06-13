import type { Page } from "@sveltejs/kit"
import type { Readable, Subscriber } from "svelte/store"

export default () => {
  let pageValue: Omit<Page, "state"> = {
    url: new URL("http://localhost:3000"),
    params: {},
    status: 200,
    error: null,
    data: {},
    route: {
      id: null,
    },
    form: undefined,
  }

  let subscription: Subscriber<Omit<Page, "state">> | undefined
  const setPage = (newValue: Partial<Page>) => {
    pageValue = {
      ...pageValue,
      ...newValue,
    }
    subscription?.(pageValue)
  }

  const pageStore: Readable<Omit<Page, "state">> = {
    subscribe: (subFn) => {
      subscription = subFn
      subscription(pageValue)

      return () => {
        subscription = undefined
      }
    },
  }

  return {
    page: pageStore,
    setPage,
  }
}
