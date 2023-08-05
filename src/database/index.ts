import { knex as setupKnex, Knex } from 'knex'
import { parsedEnv } from 'environment'

export const configDatase: Knex.Config = {
  client: parsedEnv.DATABASE_CLIENT,
  connection: parsedEnv.DATABASE_CONNECTION,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './src/database/migrations',
  },
}
export const knex = setupKnex(configDatase)
