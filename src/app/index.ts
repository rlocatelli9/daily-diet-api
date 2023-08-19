import fastify from 'fastify'

import cookie from '@fastify/cookie'

import { UsersRoutes } from '@routes/users'
import { RegisterRoutes } from '@routes/register'

export const app = fastify()

app.register(cookie)

app.register(RegisterRoutes, {
  prefix: 'register',
})

app.register(UsersRoutes, {
  prefix: 'users',
})
