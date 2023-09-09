import crypto from 'node:crypto'

import type { SerializeOptions } from '@fastify/cookie'
import type { FastifyInstance } from 'fastify'

import { z } from 'zod'

import { knex } from 'database'
import { checkSessionIdExists, checkUserIdExists } from 'middlewares'
import { decrypt, getErrorMessage } from 'utils'
import { parsedEnv } from '@environment/index'

export async function RegisterRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const sessions = await knex('sessions')
        .select(
          'sessions.created_at as created_at',
          'sessions.expires as espires',
          'sessions.updated_at as updated_at',
          'sessions.id as session_id',
          'users.id as user_id',
          'users.username as username',
        )
        .innerJoin('users', 'sessions.user_id_session', 'users.id')

      reply.status(200).send({ data: sessions })
    },
  )

  app.post('/signup', async (request, reply) => {
    const validateUserBodySchema = z.object({
      username: z.string().nonempty(),
      email: z.string().nonempty(),
      password: z.string().nonempty(),
    })

    try {
      const { username, email, password } = validateUserBodySchema.parse(
        request.body,
      )

      const sessionId = crypto.randomUUID()

      const date = new Date()
      const expires = new Date(date.setDate(date.getDate() + 7))

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: expires.getMilliseconds(),
        expires,
      } as SerializeOptions)

      const userId = crypto.randomUUID()

      await knex('users').insert({
        id: userId,
        username,
        email,
        password,
      })

      await knex('sessions').insert({
        id: sessionId,
        user_id_session: userId,
        expires: expires.toISOString(),
      })

      reply.status(201).send()
    } catch (error) {
      reply.status(400).send({ error: getErrorMessage(error) })
    }
  })

  app.post('/signin', async (request, reply) => {
    const validateUserBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })
    const { email, password } = validateUserBodySchema.parse(request.body)
    const user = await knex('users').where({ email }).first()
    if (!user) {
      return reply.code(401).send({ error: 'User not found' })
    }
    if (user.password !== password) {
      return reply.code(401).send({ error: 'The data is incorrect' })
    }

    const sessionId = crypto.randomUUID()
    const date = new Date()
    const expires = new Date(date.setDate(date.getDate() + 7))

    await knex('sessions')
      .update({
        id: sessionId,
        expires: expires.toISOString(),
      })
      .where({ user_id_session: user.id })

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7days in miliseconds
      expires,
    } as SerializeOptions)

    reply.status(200).send({
      data: {
        username: user.username,
        email: user.email,
      },
    })
  })

  app.patch(
    '/signout',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const date = new Date().toISOString()

      const session = await knex('sessions').where({ id: sessionId }).update({
        expires: date,
        updated_at: date,
      })

      if (session !== 0) {
        reply.clearCookie('sessionId', {
          path: '/',
          domain: 'localhost',
        })

        reply.status(204).send()
      } else {
        reply.status(400).send({
          error: {
            message: 'Ocorreu um erro na sua requisição. Tente novamente!',
          },
        })
      }
    },
  )

  app.post(
    '/meal',
    {
      preHandler: [checkSessionIdExists, checkUserIdExists],
    },
    async (request, reply) => {
      const userId: string = request.headers.user as string

      const decrypted = decrypt(userId, parsedEnv.SECRET_KEY)
      if (!decrypted || decrypted === '') {
        reply.status(400).send({
          error: 'User not found. Please try again after the login.',
        })
      }

      const validateMealBodySchema = z.object({
        title: z.string().nonempty(),
        datetime: z.string().datetime().pipe(z.coerce.date()),
        description: z.string().nonempty(),
        inDiet: z.boolean(),
      })

      try {
        const { description, inDiet, title, datetime } =
          validateMealBodySchema.parse(request.body)

        await knex('meals').insert({
          id: crypto.randomUUID(),
          owner: decrypted,
          title,
          description,
          datetime: datetime.toISOString(),
          in_diet: inDiet,
        })

        reply.status(201).send()
      } catch (error) {
        reply.status(400).send({ error: getErrorMessage(error) })
      }
    },
  )
}
