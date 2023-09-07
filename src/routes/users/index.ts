import type { FastifyInstance } from 'fastify'

import { z } from 'zod'

import { knex } from 'database'
import { checkSessionIdExists } from 'middlewares'

export async function UsersRoutes(app: FastifyInstance) {
  app.get(
    '/list',
    {
      preHandler: checkSessionIdExists,
    },
    async (req, reply) => {
      const users = await knex('users').select('*').whereNull('deleted_at')

      reply.status(201).send({ data: users })
    },
  )

  app.delete(
    '/delete/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const deleteParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = deleteParamsSchema.parse(request.params)

      const user = await knex('users').where({ id }).first()

      if (!user) {
        reply.status(401).send({ error: 'User not found' })
      }

      await knex('users')
        .update({ deleted_at: new Date().toISOString() })
        .where({ id })

      reply.status(201).send()
    },
  )
}
