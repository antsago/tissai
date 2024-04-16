import pg from "pg"

let Pool = pg.Pool
export function setPg(mock: typeof pg.Pool) {
  Pool = mock
}

const Db = () => {
  const pool = new Pool()

	const runQuery = async (query: string) => {
		const response = await pool.query(query)
		return response.rows
	}

  return {
    query: runQuery,
  }
}

export default Db 
