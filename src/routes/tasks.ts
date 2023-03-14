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
      const getTasksQuerySchema = z.object({
        search: z.string().optional(),
      })

      try {
        const { sessionId } = request.cookies
        const { search } = getTasksQuerySchema.parse(request.query)

        const tasks = await knex('tasks')
          .where('session_id', sessionId)
          .modify((queryBuilder) => {
            if (search) {
              queryBuilder.where(function () {
                this.where('title', 'like', `%${search}%`)
              })
            } else {
              queryBuilder.select()
            }
          })
          .select()

        return reply.send({ tasks })
      } catch (error) {
        console.error(error)
        throw new Error('Failed to get task list')
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
    } catch {
      throw new Error('Failed to create task')
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
      } catch {
        throw new Error('Failed to delete task')
      }
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkSessionIdexists] },
    async (request, reply) => {
      const getTasksParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const getTasksBodySchema = z.object({
        title: z.string(),
        description: z.string(),
      })

      try {
        const { id } = getTasksParamsSchema.parse(request.params)
        const { sessionId } = request.cookies

        const { title, description } = getTasksBodySchema.parse(request.body)

        await knex('tasks')
          .where({ session_id: sessionId, id })
          .update({ title, description })

        return reply.status(204).send()
      } catch {
        throw new Error('Failed to edit task')
      }
    },
  )

  app.patch(
    '/:id/complete',
    { preHandler: [checkSessionIdexists] },
    async (request, reply) => {
      const getTasksParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const getTasksBodySchema = z.object({
        completedAt: z.boolean(),
      })

      try {
        const { id } = getTasksParamsSchema.parse(request.params)
        const { sessionId } = request.cookies

        const { completedAt } = getTasksBodySchema.parse(request.body)

        await knex('tasks')
          .where({ session_id: sessionId, id })
          .update({ completed_at: completedAt, updated_at: knex.fn.now() })

        return reply.status(200).send()
      } catch {
        throw new Error('Failed to complete task')
      }
    },
  )
}
