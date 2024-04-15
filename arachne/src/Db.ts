import pg from "pg"

let Pool = pg.Pool
export function setPg(mock: typeof pg.Pool) {
  Pool = mock
}

const Db = () => {
  const pool = new Pool()

  return {}
}

export default Db 
