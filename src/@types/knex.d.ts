// eslint-disable-next-line
import { Knex } from 'knex'
// ou faça apenas:
// import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    tasks: {
      id: string
      title: string
      description: string
      created_at: string
      updated_at: string
      completed_at: boolean | number
      session_id?: string
    }
  }
}
