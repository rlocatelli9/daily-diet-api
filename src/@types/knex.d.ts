import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      username: string
      email: string
      password: string
      created_at?: string
      updated_at?: string
      deleted_at?: string
    }
    meals: {
      owner: string
      id: string
      type: string
      title: string
      description?: string
      datetime: string
      in_diet: boolean
      created_at?: string
      updated_at?: string
      deleted_at?: string
    }
    sessions: {
      id: string
      user_id_session: string
      expires: string
      created_at?: string
      updated_at?: string
    }
  }
}
