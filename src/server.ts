import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { env } from './env'
import { tasksRoutes } from './routes/tasks'

const app = fastify()

app.register(cookie)
app.register(tasksRoutes, {
  prefix: 'tasks',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
