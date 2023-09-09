import { config } from 'dotenv'
import { z as zod } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = zod.object({
  NODE_ENV: zod
    .enum(['development', 'test', 'staging', 'production'])
    .default('production'),
  DATABASE_CLIENT: zod.enum(['sqlite', 'pg']),
  DATABASE_URL: zod.string(),
  PORT: zod.coerce.number().default(3333),
  SECRET_KEY: zod.string(),
})

export const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const parsedEnv = {
  ..._env.data,
  DATABASE_CONNECTION:
    _env.data.DATABASE_CLIENT === 'sqlite'
      ? {
          filename: _env.data.DATABASE_URL,
        }
      : _env.data.DATABASE_URL,
}
