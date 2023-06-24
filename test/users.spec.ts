import { expect, afterAll, beforeAll, describe, it, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
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

  it('should be able to create a new user.', async () => {
    const user = {
      name: 'user',
      email: 'user@gmail.com',
      password: '123456',
    }
    const response = await request(app.server)
      .post('/users')
      .send(user)
      .expect(201)

    expect(response.body.user).contain(user)
  })

  it('should be able to login.', async () => {
    const user = {
      name: 'user',
      email: 'user@gmail.com',
      password: '123456',
    }
    await request(app.server).post('/users').send(user).expect(201)

    const response = await request(app.server)
      .post('/users/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    expect(response.body.user).contain(user)
  })
})
