import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'node:child_process'

describe('Tasks routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new task', async () => {
    await request(app.server)
      .post('/tasks')
      .send({
        title: 'Jogar Valorant',
        description: 'Tentar não entregar o jogo',
      })
      .expect(201)
  })

  it('should be able to list all tasks', async () => {
    const createTaskResponse = await request(app.server).post('/tasks').send({
      title: 'Jogar Valorant',
      description: 'Tentar não entregar o jogo',
    })

    const cookies = createTaskResponse.get('Set-Cookie')

    const listTasksResponse = await request(app.server)
      .get('/tasks')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTasksResponse.body.tasks).toEqual([
      expect.objectContaining({
        title: 'Jogar Valorant',
        description: 'Tentar não entregar o jogo',
      }),
    ])
  })

  it('should be able to get a specific task', async () => {
    const createTaskResponse = await request(app.server).post('/tasks').send({
      title: 'Jogar Valorant',
      description: 'Tentar não entregar o jogo',
    })

    const cookies = createTaskResponse.get('Set-Cookie')

    const listTasksResponse = await request(app.server)
      .get('/tasks')
      .set('Cookie', cookies)
      .expect(200)

    const taskId = listTasksResponse.body.tasks[0].id

    const getTaskResponse = await request(app.server)
      .get(`/tasks/${taskId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTaskResponse.body.task).toEqual(
      expect.objectContaining({
        title: 'Jogar Valorant',
        description: 'Tentar não entregar o jogo',
      }),
    )
  })

  it('should be able to get task with query', async () => {
    const createTaskResponse = await request(app.server).post('/tasks').send({
      title: 'Jogar Valorant',
      description: 'Tentar não entregar o jogo',
    })

    const cookies = createTaskResponse.get('Set-Cookie')

    const listTasksResponse = await request(app.server)
      .get('/tasks?search=Jogar%20Valorant')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTasksResponse.body.tasks).toEqual([
      expect.objectContaining({
        title: 'Jogar Valorant',
      }),
    ])
  })

  it('should be able to delete task', async () => {
    const createTaskResponse = await request(app.server).post('/tasks').send({
      title: 'Jogar Valorant',
      description: 'Tentar não entregar o jogo',
    })

    const cookies = createTaskResponse.get('Set-Cookie')

    const listTasksResponse = await request(app.server)
      .get('/tasks')
      .set('Cookie', cookies)
      .expect(200)

    const taskId = listTasksResponse.body.tasks[0].id

    await request(app.server)
      .delete(`/tasks/${taskId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to edit task', async () => {
    const createTaskResponse = await request(app.server).post('/tasks').send({
      title: 'Jogar Valorant',
      description: 'Tentar não entregar o jogo',
    })

    const cookies = createTaskResponse.get('Set-Cookie')

    const listTasksResponse = await request(app.server)
      .get('/tasks')
      .set('Cookie', cookies)
      .expect(200)

    const taskId = listTasksResponse.body.tasks[0].id

    await request(app.server)
      .put(`/tasks/${taskId}`)
      .set('Cookie', cookies)
      .send({
        title: 'Jogar Lol',
        description: 'Não trolar',
      })
      .expect(204)

    const updatedTaskResponse = await request(app.server)
      .get(`/tasks/${taskId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(updatedTaskResponse.body.task).toEqual(
      expect.objectContaining({
        title: 'Jogar Lol',
        description: 'Não trolar',
      }),
    )
  })

  it.todo('must be able to edit task to true', async () => {
    const createTaskResponse = await request(app.server).post('/tasks').send({
      title: 'Jogar Valorant',
      description: 'Tentar não entregar o jogo',
    })

    const cookies = createTaskResponse.get('Set-Cookie')

    const listTasksResponse = await request(app.server)
      .get('/tasks')
      .set('Cookie', cookies)
      .expect(200)

    const taskId = listTasksResponse.body.tasks[0].id

    await request(app.server)
      .patch(`/tasks/${taskId}/complete`)
      .set('Cookie', cookies)
      .send({
        completed_at: 1,
        updated_at: '2023-03-15T10:30:00.000Z',
      })
      .expect(204)

    const updatedTaskResponse = await request(app.server)
      .get(`/tasks/${taskId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(updatedTaskResponse.body.task).toEqual(
      expect.objectContaining({
        completed_at: 1,
        updated_at: '2023-03-15T10:30:00.000Z',
      }),
    )
  })
})
