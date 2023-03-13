import fastify from 'fastify'
import { env } from './env'
import { tasksRoutes } from './routes/tasks'

const app = fastify()

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
