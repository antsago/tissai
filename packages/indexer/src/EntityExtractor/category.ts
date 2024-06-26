import type {
  Category,
} from "@tissai/db"
import type { PythonPool } from "@tissai/python-pool"

async function category(title: string, python: PythonPool<string, { category: string }>): Promise<Category> {
  const derivedInfo = await python.send(title)

  return {
    name: derivedInfo.category,
  }
}

export default category
