import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      username: string
      email: string
      password: string
      created_at: number
      updated_at?: number
      deleted_at?: number
    }
    meals: {
      owner: string
      id: string
      type: string
      title: string
      description?: string
      datetime: number
      in_diet: boolean
      created_at: number
      updated_at?: number
      deleted_at?: number
    }
  }
}
