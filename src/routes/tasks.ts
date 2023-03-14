import { randomUUID } from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdexists } from '../middlewares/check-session-id-exists'

export async function tasksRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}] ${request.url}`)
  })

  app.get('/', { preHandler: [checkSessionIdexists] }, async (request) => {
    const { sessionId } = request.cookies

    const tasks = await knex('tasks').where('session_id', sessionId).select()

    return { tasks }
  })

  app.get('/:id', { preHandler: [checkSessionIdexists] }, async (request) => {
    const getTasksParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTasksParamsSchema.parse(request.params)
    const { sessionId } = request.cookies

    const task = await knex('tasks')
      .where({ session_id: sessionId, id })
      .first()

    return { task }
  })

  app.post('/', async (request, reply) => {
    const createTasksBodySchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const { title, description } = createTasksBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
    }

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    await knex('tasks').insert({
      id: randomUUID(),
      title,
      description,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
