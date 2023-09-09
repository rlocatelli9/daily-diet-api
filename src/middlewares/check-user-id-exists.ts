import { knex } from '@database/index'
import { FastifyReply, FastifyRequest } from 'fastify'
import { encrypt } from 'utils'
import { parsedEnv } from 'environment'

export async function checkUserIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  const user = await knex('sessions')
    .select('user_id_session as id')
    .where({ id: sessionId })
    .first()

  if (!user) {
    return reply.status(401).send({
      error: 'User not found',
    })
  }

  let id = ''

  try {
    id = encrypt(user.id, parsedEnv.SECRET_KEY)
  } catch (error) {
    console.log(error)
  }

  request.headers.user = id
}
