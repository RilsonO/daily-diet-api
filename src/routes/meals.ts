import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkUserExists } from '../middlewares/check-user-exists'
import { checkMealExists } from '../middlewares/check-meal-exists'
import { mealBodyValidation } from '../middlewares/meal-body-validation'

interface Metrics {
  inDietPercentage: number
  bestSequency: number
  total: number
  totalInDiet: number
  totalOutDiet: number
}

const MEAL_BODY_SCHEMA = z.object({
  name: z.string(),
  description: z.string(),
  date: z.string(),
  time: z.string(),
  isInDiet: z.boolean(),
})

const USER_QUERY_SCHEMA = z.object({
  userId: z.string(),
})

const MEAL_PARAMS_SCHEMA = z.object({
  id: z
    .string({
      required_error: 'id is required.',
      invalid_type_error: 'id must be a string.',
    })
    .uuid('id must be an valid uuid.'),
})

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkUserExists)

  app.post(
    '/',
    {
      preHandler: [mealBodyValidation],
    },
    async (request, reply) => {
      const { name, description, date, time, isInDiet } =
        MEAL_BODY_SCHEMA.parse(request.body)
      const { userId } = USER_QUERY_SCHEMA.parse(request.query)

      const meal = await knex('meals')
        .insert({
          id: randomUUID(),
          name,
          description,
          date,
          time,
          isInDiet,
          userId,
        })
        .returning('*')

      return reply.status(201).send({ meal: meal[0] })
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkMealExists, mealBodyValidation],
    },
    async (request, reply) => {
      const { name, description, date, time, isInDiet } =
        MEAL_BODY_SCHEMA.parse(request.body)
      const { id } = MEAL_PARAMS_SCHEMA.parse(request.params)

      const meal = await knex('meals')
        .where({ id })
        .update({
          name,
          description,
          date,
          time,
          isInDiet,
          updated_at: new Date().toISOString(),
        })
        .returning('*')

      return reply.status(200).send({ meal: meal[0] })
    },
  )

  app.get('/', async (request, reply) => {
    const { userId } = USER_QUERY_SCHEMA.parse(request.query)
    const meals = await knex('meals')
      .where({ userId })
      .orderBy('date', 'desc')
      .select('*')

    return reply.status(200).send({ meals })
  })

  app.delete(
    '/:id',
    {
      preHandler: [checkMealExists],
    },
    async (request, reply) => {
      const { id } = MEAL_PARAMS_SCHEMA.parse(request.params)
      const { userId } = USER_QUERY_SCHEMA.parse(request.query)

      const deletionResult = await knex('meals').where({ id, userId }).delete()

      if (deletionResult === 0) {
        return reply
          .status(404)
          .send({ message: 'Meal not found or user does not have permission.' })
      }

      return reply.status(200).send({ message: 'Meal deleted.' })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkMealExists],
    },
    async (request, reply) => {
      const { id } = MEAL_PARAMS_SCHEMA.parse(request.params)
      const { userId } = USER_QUERY_SCHEMA.parse(request.query)

      const meal = await knex('meals').where({ id, userId }).first()

      if (!meal) {
        return reply.status(404).send({ message: 'Not found.' })
      }

      return reply.status(200).send({ meal })
    },
  )

  app.get('/metrics', async (request, reply) => {
    const { userId } = USER_QUERY_SCHEMA.parse(request.query)

    const meals = await knex('meals')
      .where({ userId })
      .orderBy('date', 'desc')
      .select('*')

    if (!meals) {
      return reply.status(404).send({ message: 'Not found.' })
    }

    const metrics = {
      total: meals.length,
      bestSequency: 0,
      inDietPercentage: 0,
      totalInDiet: 0,
      totalOutDiet: 0,
    } as Metrics

    let auxSequency = 0

    meals.forEach((meal) => {
      if (meal.isInDiet) {
        metrics.totalInDiet += 1
        auxSequency += 1
        if (auxSequency > metrics.bestSequency) {
          metrics.bestSequency = auxSequency
        }
      } else {
        metrics.totalOutDiet += 1
        auxSequency = 0
      }
    })

    metrics.inDietPercentage = metrics.totalInDiet / 8

    return reply.status(200).send({ metrics })
  })
}
