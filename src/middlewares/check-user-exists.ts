import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function checkUserExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createUserQuerySchema = z.object({
    userId: z
      .string({
        required_error: 'UserId is required.',
        invalid_type_error: 'UserId must be a string.',
      })
      .uuid('UserId must be an valid uuid.'),
  })

  const _query = createUserQuerySchema.safeParse(request.query)

  if (_query.success === false) {
    const errorMessages = _query.error.flatten().fieldErrors
    return reply.status(400).send(errorMessages)
  }

  const { userId } = _query.data

  const existingUser = await knex('users').where({ id: userId }).first()

  if (!existingUser) {
    return reply.status(404).send({ message: 'User not found!' })
  }
}
