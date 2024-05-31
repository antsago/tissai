import originalOra, { spinners } from 'ora'

let ora = originalOra
export function setOra(mock: typeof originalOra) {
  ora = mock
}

export function Reporter(isSilent = false) {
  const errors: string[] = []
  const logs: string[] = []
  const spinner = ora({
    spinner: spinners.sand,
    isSilent,
  }).start()

  return {
    progress: (text: string) => {
      spinner.text = `${text}\n`
    },
    succeed: (text: string) => {
      spinner.succeed(`${text}\n`)
    },
    fail: (text: string) => {
      spinner.fail(`${text}\n`)
    },
    error: (errorMessage: string) => {
      errors.push(`  • ${errorMessage}`)
      spinner.prefixText = `Errors:\n${errors.join('\n')}\n\n`
    },
    log: (message: string) => {
      logs.push(message)
      spinner.prefixText = `Logs:\n${logs.join('\n')}\n\n`
    },
  }
}
export type Reporter = ReturnType<typeof Reporter>

export let reporter = Reporter()
export function resetReporter() {
  reporter = Reporter()
}
