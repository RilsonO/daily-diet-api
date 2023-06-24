import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkUserAlreadyExists } from '../middlewares/check-user-already-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkUserAlreadyExists],
    },
    async (request, reply) => {
      const createUserBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
      })

      const { name, email, password } = createUserBodySchema.parse(request.body)

      const user = await knex('users')
        .insert({
          id: randomUUID(),
          name,
          email,
          password,
        })
        .returning('*')

      return reply.status(201).send({ user: user[0] })
    },
  )
  app.post('/login', async (request, reply) => {
    const createUserBodySchema = z.object({
      email: z.string().email('Email must be valid'),
      password: z.string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      }),
    })

    const _body = createUserBodySchema.safeParse(request.body)

    if (_body.success === false) {
      const errorMessages = _body.error.flatten().fieldErrors
      return reply.status(400).send(errorMessages)
    }

    const { email, password } = _body.data

    const user = await knex('users')
      .where({
        email,
        password,
      })
      .first()

    if (user) {
      return reply.status(200).send({ user })
    } else {
      return reply.status(401).send({ message: 'Invalid credentials' })
    }
  })
}
