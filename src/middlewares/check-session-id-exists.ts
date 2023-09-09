import { knex } from '@database/index'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Not found session',
    })
  }

  const session = await knex('sessions')
    .select('expires')
    .where({ id: sessionId })
    .first()

  if (!session) {
    return reply.status(401).send({
      error: 'Not found session',
    })
  }

  if (session.expires < new Date().toISOString()) {
    return reply.status(401).send({
      error: 'Expired session',
    })
  }
}
