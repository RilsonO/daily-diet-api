import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { isPastDate } from '../utils/isPastDate'
import { isTimeWithinCurrentDate } from '../utils/isTimeWithinCurrentDate'
import { isCurrentDate } from '../utils/isCurrentDate'

export async function mealBodyValidation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const DATE_REGEX = /^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
  const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

  const MEAL_BODY_SCHEMA = z
    .object({
      name: z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      }),
      description: z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      }),
      date: z
        .string({
          required_error: 'Date is required',
          invalid_type_error: 'Date must be a string',
        })
        .regex(DATE_REGEX, 'Invalid date format. Please use dd/mm/yyyy.')
        .refine(isPastDate, {
          message: 'Date cannot be in the future.',
        }),
      time: z
        .string({
          required_error: 'Time is required',
          invalid_type_error: 'Time must be a string',
        })
        .regex(TIME_REGEX, 'Invalid time format. Please use hh:mm.'),
      isInDiet: z.boolean({
        required_error: 'isInDiet is required',
        invalid_type_error: 'isInDiet must be a boolean',
      }),
    })
    .refine(
      (value) => {
        const currentDate = new Date()
        const isDateInPast = isPastDate(value.date)
        const isTimeValid = isTimeWithinCurrentDate(value.time, currentDate)

        if (isDateInPast && isCurrentDate(value.date)) {
          console.log('isTimeValid=>', isTimeValid)
          return isTimeValid
        }

        // return !isDateInPast || isTimeValid
        return true
      },
      {
        message:
          'Invalid time. Must be equal to or earlier than the current time.',
      },
    )

  const _body = MEAL_BODY_SCHEMA.safeParse(request.body)

  if (_body.success === false) {
    const errorMessages = _body.error.flatten().fieldErrors
    const futureTimeError = _body.error?.message

    if (futureTimeError && Object.keys(errorMessages).length === 0) {
      const timeError = JSON.parse(futureTimeError)
      return reply.status(400).send({
        [timeError[0].path[0] ?? 'time']: [timeError[0].message],
      })
    }

    return reply.status(400).send(errorMessages)
  }
}
