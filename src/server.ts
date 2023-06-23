import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'

const app = fastify()

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Http server Running!')
  })
