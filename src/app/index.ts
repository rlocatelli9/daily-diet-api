import { knex } from 'database'
import fastify from 'fastify'

export const app = fastify()

app.get('/hello', async () => {
  const teste = await knex('sqlite_schema').select('*')
  return teste
})
