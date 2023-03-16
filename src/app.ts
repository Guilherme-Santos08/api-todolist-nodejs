import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { tasksRoutes } from './routes/tasks'

import cors from '@fastify/cors'

export const app = fastify()

app.register(cors, {
  origin: ['http://localhost:5173'], // lista de domínios permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // lista de métodos permitidos
})

app.register(cookie)
app.register(tasksRoutes, {
  prefix: 'tasks',
})
