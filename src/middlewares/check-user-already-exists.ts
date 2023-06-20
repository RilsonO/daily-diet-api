import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function checkUserAlreadyExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createUserBodySchema = z.object({
    name: z.string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    }),
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

  const { email } = _body.data

  const existingUser = await knex('users').where({ email }).first()

  if (existingUser) {
    return reply.status(409).send({ message: 'Email already exists' })
  }
}
