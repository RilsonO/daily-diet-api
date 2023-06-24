import { expect, afterAll, beforeAll, describe, it, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

interface Meals {
  id: string
  userId: string
  name: string
  description: string
  date: string
  time: string
  isInDiet: number
  updated_at: string
  created_at: string
}

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal.', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'user',
        email: 'user@gmail.com',
        password: '123456',
      })
      .expect(201)

    const meal = {
      name: 'Almoço',
      description: 'Frango cozido com batatas e salada',
      date: '19/06/2023',
      time: '12:00',
      isInDiet: true,
    }

    const response = await request(app.server)
      .post('/meals')
      .send(meal)
      .query({ userId: userResponse.body.user.id })
      .expect(201)

    const mealResponse = {
      ...response.body.meal,
      isInDiet: response.body.meal.isInDiet === 1,
    }

    expect(mealResponse).contains(meal)
  })

  it('should be able to update a meal.', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'user',
        email: 'user@gmail.com',
        password: '123456',
      })
      .expect(201)

    const meal = {
      name: 'Almoço',
      description: 'Frango cozido com batatas e salada',
      date: '19/06/2023',
      time: '12:00',
      isInDiet: true,
    }

    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meal)
      .query({ userId: userResponse.body.user.id })
      .expect(201)

    const mealToUpdate = {
      name: 'Jantar',
      description: 'Frango cozido com batatas e salada',
      date: '19/06/2023',
      time: '19:00',
      isInDiet: true,
    }

    const response = await request(app.server)
      .put(`/meals/${mealResponse.body.meal.id}`)
      .send(mealToUpdate)
      .query({ userId: userResponse.body.user.id })
      .expect(200)

    const updatedMealResponse = {
      ...response.body.meal,
      isInDiet: response.body.meal.isInDiet === 1,
    }

    expect(updatedMealResponse).contains(mealToUpdate)
  })

  it('should be able to get all meals from a user.', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'user',
        email: 'user@gmail.com',
        password: '123456',
      })
      .expect(201)

    const mealsToCreate = [
      {
        name: 'Café da manhã',
        description: 'Pão com manteiga e café',
        date: '19/06/2023',
        time: '07:00',
        isInDiet: true,
      },
      {
        name: 'Almoço',
        description: 'Frango cozido com batatas e salada',
        date: '19/06/2023',
        time: '12:00',
        isInDiet: true,
      },
      {
        name: 'Café da tarde',
        description: 'Café com biscoito',
        date: '19/06/2023',
        time: '15:00',
        isInDiet: true,
      },
    ]

    mealsToCreate.forEach(async (meal) => {
      await request(app.server)
        .post('/meals')
        .send(meal)
        .query({ userId: userResponse.body.user.id })
        .expect(201)
    })

    const response = await request(app.server)
      .get(`/meals`)
      .query({ userId: userResponse.body.user.id })
      .expect(200)

    const MealsResponse = response.body.meals.map((meal: Meals) => {
      return {
        name: meal.name,
        description: meal.description,
        date: meal.date,
        time: meal.time,
        isInDiet: meal.isInDiet === 1,
      }
    })

    expect(MealsResponse).to.deep.include.members(mealsToCreate)
  })

  it('should be able to delete a meal.', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'user',
        email: 'user@gmail.com',
        password: '123456',
      })
      .expect(201)

    const meal = {
      name: 'Almoço',
      description: 'Frango cozido com batatas e salada',
      date: '19/06/2023',
      time: '12:00',
      isInDiet: true,
    }

    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meal)
      .query({ userId: userResponse.body.user.id })
      .expect(201)

    await request(app.server)
      .delete(`/meals/${mealResponse.body.meal.id}`)
      .query({ userId: userResponse.body.user.id })
      .expect(200)

    const response = await request(app.server)
      .get(`/meals`)
      .query({ userId: userResponse.body.user.id })
      .expect(200)

    expect(response.body.meals.length).toEqual(0)
  })

  it('should be able to get a meal by id.', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'user',
        email: 'user@gmail.com',
        password: '123456',
      })
      .expect(201)

    const meal = {
      name: 'Almoço',
      description: 'Frango cozido com batatas e salada',
      date: '19/06/2023',
      time: '12:00',
      isInDiet: true,
    }

    const mealResponse = await request(app.server)
      .post('/meals')
      .send(meal)
      .query({ userId: userResponse.body.user.id })
      .expect(201)

    const response = await request(app.server)
      .get(`/meals/${mealResponse.body.meal.id}`)
      .query({ userId: userResponse.body.user.id })
      .expect(200)

    expect(response.body.meal).toEqual(mealResponse.body.meal)
  })

  it('should be able to get metrics of meals from a user.', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'user',
        email: 'user@gmail.com',
        password: '123456',
      })
      .expect(201)

    const mealsToCreate = [
      {
        name: 'Almoço',
        description: 'Fango cozido com batatas e salada',
        date: '22/06/2023',
        time: '12:00',
        isInDiet: true,
      },
      {
        name: 'Almoço',
        description: 'Arroz, feijão, salada e bife',
        date: '21/06/2023',
        time: '18:49',
        isInDiet: false,
      },
      {
        name: 'Café da Manhã',
        description: 'Misto quente',
        date: '21/06/2023',
        time: '13:14',
        isInDiet: false,
      },
      {
        name: 'Café da tarde',
        description: 'Hamburguer',
        date: '20/06/2023',
        time: '18:14',
        isInDiet: true,
      },
      {
        name: 'Almoço',
        description: 'Arroz, feijão e salada',
        date: '20/06/2023',
        time: '18:14',
        isInDiet: true,
      },
      {
        name: 'Café da manhã',
        description: 'Ovos mexidos',
        date: '20/06/2023',
        time: '08:00',
        isInDiet: true,
      },
      {
        name: 'Jantar',
        description: 'Fango cozido com batatas e salada',
        date: '20/06/2023',
        time: '18:00',
        isInDiet: true,
      },
      {
        name: 'Almço',
        description: 'Fango cozido com batatas e salada',
        date: '19/06/2023',
        time: '12:00',
        isInDiet: true,
      },
      {
        name: 'Almço',
        description: 'Fango cozido com batatas e salada',
        date: '19/06/2023',
        time: '12:00',
        isInDiet: true,
      },
    ]

    mealsToCreate.forEach(async (meal) => {
      await request(app.server)
        .post('/meals')
        .send(meal)
        .query({ userId: userResponse.body.user.id })
        .expect(201)
    })

    const response = await request(app.server)
      .get(`/meals/metrics`)
      .query({ userId: userResponse.body.user.id })
      .expect(200)

    expect(response.body.metrics).toEqual({
      total: 9,
      bestSequency: 6,
      inDietPercentage: 0.875,
      totalInDiet: 7,
      totalOutDiet: 2,
    })
  })
})
