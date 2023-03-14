import { randomUUID } from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdexists } from '../middlewares/check-session-id-exists'

export async function tasksRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}] ${request.url}`)
  })

  app.get(
    '/',
    { preHandler: [checkSessionIdexists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const tasks = await knex('tasks').where('session_id', sessionId).select()

      return reply.status(200).send({ tasks })
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdexists] },
    async (request, reply) => {
      const getTasksParamsSchema = z.object({
        id: z.string().uuid(),
      })

      try {
        const { id } = getTasksParamsSchema.parse(request.params)
        const { sessionId } = request.cookies

        const task = await knex('tasks')
          .where({ session_id: sessionId, id })
          .first()

        return reply.status(200).send({ task })
      } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  )

  app.post('/', async (request, reply) => {
    const createTasksBodySchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    try {
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
    } catch (err) {
      console.error(err)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdexists] },
    async (request, reply) => {
      const getTasksParamsSchema = z.object({
        id: z.string().uuid(),
      })

      try {
        const { id } = getTasksParamsSchema.parse(request.params)
        const { sessionId } = request.cookies

        await knex('tasks').where({ session_id: sessionId, id }).del()

        return reply.status(204).send()
      } catch (err) {
        console.error(err)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  )

  app.put('/:id', async (request, reply) => {
    const getTasksParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const getTasksBodySchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    try {
      const { id } = getTasksParamsSchema.parse(request.params)
      const { title, description } = getTasksBodySchema.parse(request.body)

      await knex('tasks').where('id', id).update({ title, description })

      return reply.status(204).send()
    } catch (err) {
      console.error(err)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  app.patch('/:id/complete', async (request, reply) => {
    const getTasksParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const getTasksBodySchema = z.object({
      completedAt: z.boolean(),
    })

    try {
      const { id } = getTasksParamsSchema.parse(request.params)
      const { completedAt } = getTasksBodySchema.parse(request.body)

      await knex('tasks').where({ id }).update('completed_at', completedAt)

      return reply.status(200).send()
    } catch (err) {
      console.error(err)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
}
