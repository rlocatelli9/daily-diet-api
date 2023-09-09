import type { FastifyInstance } from 'fastify'

import { z } from 'zod'

import { knex } from 'database'
import { checkSessionIdExists, checkUserIdExists } from 'middlewares'
import { parsedEnv } from 'environment'
import { decrypt, getErrorMessage } from 'utils'

export async function MealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (req, reply) => {
      const meals = await knex('meals').select('*').whereNull('deleted_at')

      reply.status(200).send({ data: meals })
    },
  )

  app.get(
    '/list',
    {
      preHandler: [checkSessionIdExists, checkUserIdExists],
    },
    async (request, reply) => {
      const id: string = request.headers.user as string

      const decrypted = decrypt(id, parsedEnv.SECRET_KEY)
      if (!decrypted || decrypted === '') {
        reply.status(400).send({
          error: 'User not found. Please try again after the login.',
        })
      }

      const meals = await knex('meals')
        .select('*')
        .where({ owner: decrypted })
        .whereNull('deleted_at')
        .orderBy('datetime')
      reply.status(200).send({ data: meals })
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists, checkUserIdExists],
    },
    async (request, reply) => {
      const id: string = request.headers.user as string

      const decrypted = decrypt(id, parsedEnv.SECRET_KEY)
      if (!decrypted || decrypted === '') {
        reply.status(400).send({
          error: 'User not found. Please try again after the login.',
        })
      }

      const meals = await knex('meals')
        .select('*')
        .where({ owner: decrypted })
        .whereNull('deleted_at')
        .orderBy('datetime')

      const sequence = {
        total: 0,
        better: 0,
      }

      meals.reduce((acc, item) => {
        if (item.in_diet) {
          acc.total += 1
          if (acc.better < acc.total) {
            acc.better = acc.total
          }
        } else {
          acc.total = 0
        }
        console.log({ acc })
        return acc
      }, sequence)

      const metrics = {
        total: meals.length,
        in: meals.filter((meal) => meal.in_diet).length,
        out: meals.filter((meal) => !meal.in_diet).length,
        sequence: sequence.better,
      }

      reply.status(200).send({ data: metrics })
    },
  )

  app.get(
    '/:id',
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

      const getParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({ id })
        .where({ owner: decrypted })
        .first()

      if (!meal) {
        reply.status(404).send({ message: 'Meal not found' })
      }

      reply.status(200).send({ data: meal })
    },
  )

  app.put(
    '/:id',
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

      const deleteParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = deleteParamsSchema.parse(request.params)

      const oldMeal = await knex('meals')
        .select('title', 'description', 'datetime', 'in_diet as inDiet')
        .where({ id })
        .where({ owner: decrypted })
        .first()

      if (!oldMeal) {
        reply.status(401).send({ erro: 'Meal is not exists' })
      }

      const validateMealBodySchema = z
        .object({
          title: z.string(),
          datetime: z.string().datetime().pipe(z.coerce.date()),
          description: z.string(),
          inDiet: z.boolean(),
        })
        .partial()

      const { datetime, description, inDiet, title } =
        validateMealBodySchema.parse(request.body)

      try {
        const updatedMeal = await knex('meals')
          .update(
            {
              title,
              description,
              datetime: datetime?.toISOString(),
              in_diet: inDiet || oldMeal.inDiet,
              updated_at: new Date().toISOString(),
            },
            ['title', 'description', 'datetime', 'in_diet', 'updated_at'],
          )
          .where({ id })
          .where({ owner: decrypted })
          .then()
          .catch((err) => console.log(err))

        reply.status(200).send({ data: updatedMeal })
      } catch (error) {
        reply.status(400).send({ error: getErrorMessage(error) })
      }
    },
  )

  app.delete(
    '/delete/:id',
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

      const deleteParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = deleteParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({ id })
        .where({ owner: decrypted })
        .first()

      if (!meal) {
        reply.status(401).send({ error: 'Meal not found' })
      }

      try {
        await knex('meals')
          .update({ deleted_at: new Date().toISOString() })
          .where({ id })
          .where({ owner: decrypted })

        reply.status(204).send()
      } catch (error) {
        reply.status(400).send({ error: getErrorMessage(error) })
      }
    },
  )
}
