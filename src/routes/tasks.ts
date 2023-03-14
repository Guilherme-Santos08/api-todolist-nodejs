import { randomUUID } from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'

export async function tasksRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const tasks = await knex('tasks').select()

    return { tasks }
  })

  app.get('/:id', async (request) => {
    const getTasksParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTasksParamsSchema.parse(request.params)

    const task = await knex('tasks').where('id', id).first()

    return { task }
  })

  app.post('/', async (request, reply) => {
    const createTasksBodySchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const { title, description } = createTasksBodySchema.parse(request.body)

    await knex('tasks').insert({
      id: randomUUID(),
      title,
      description,
    })

    return reply.status(201).send()
  })
}
