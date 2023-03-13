import { randomUUID } from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'

export async function tasksRoutes(app: FastifyInstance) {
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

    // const taskUnique = await knex('tasks')
    //   .where('id', '2c330bd5-4263-463a-a8a0-578f16cbaf58')
    //   .select('*')

    // const tasks = await knex('tasks').select('*')

    return reply.status(201).send()
  })
}
