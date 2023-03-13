import fastify from 'fastify'
import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/hellow', async () => {
  /*
  const taskUnique = await knex('tasks')
    .where('id', '2c330bd5-4263-463a-a8a0-578f16cbaf58')
    .select('*')
  const tasks = await knex('tasks').select('*')

  return tasks
  */
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
