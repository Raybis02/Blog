const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const User = require('../models/user')

const api = supertest(app)

const initialUsers = [
  {
    'username': 'Socrates',
    'name': 'Marshall Cuso',
    'passwordHash': 'Socrates1'
  },
  {
    'username': 'Tiger Philanthropist',
    'name': 'Steven Universe',
    'passwordHash': '6814be1781f9192b4481fe50'
  },
  {
    'username': 'Levi',
    'name': 'Azi',
    'passwordHash': '6814be3181f9192b4481fe52'
  },
]

beforeEach(async () => {
  await User.deleteMany({})
  await User.insertMany(initialUsers)
})

describe('Test for GET request', () => {
  test('correct number of blogs are returned as json', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialUsers.length)
  })

  test('GET request with id returns corresponding user', async () => {
    const response = await api.get('/api/users')

    const user = await api
      .get(`/api/users/${response.body[0].id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    console.log(user.body)
    assert.strictEqual(user.body.username, initialUsers[0].username)
  })
})

describe('Tests for POST request', () => {
  test('adding user with valid input succeeds with response 201', async () => {
    const newUser = {
      'username': 'Azarath Metrion Zinthos',
      'name': 'Raven',
      'password': 'Raven 1'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const afterRequest = await api.get('/api/users')

    const usernames = afterRequest.body.map(elem => elem.username)

    assert.strictEqual(afterRequest.body.length, initialUsers.length + 1)
    assert.strictEqual(usernames.includes('Azarath Metrion Zinthos'), true)
  })

  describe('Testing invalid inputs', () => {
    test('invalid input for password fails with 400', async () => {
      const newUser = {
        'username': 'Azarath Metrion Zinthos',
        'name': 'Raven',
        'password': 'Ra'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const afterRequest = await api.get('/api/users')

      const usernames = afterRequest.body.map(elem => elem.username)

      assert.strictEqual(afterRequest.body.length, initialUsers.length)
      assert.strictEqual(!usernames.includes('Azarath Metrion Zinthos'), true)
    })

    test('invalid input for username fails with 400', async () => {
      const newUser = {
        'username': 'Az',
        'name': 'Raven',
        'password': 'Raven1'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const afterRequest = await api.get('/api/users')

      const usernames = afterRequest.body.map(elem => elem.username)

      assert.strictEqual(afterRequest.body.length, initialUsers.length)
      assert.strictEqual(!usernames.includes('Azarath Metrion Zinthos'), true)
    })

    test('no input for username fails with 400', async () => {
      const newUser = {
        'name': 'Raven',
        'password': 'Raven1'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const afterRequest = await api.get('/api/users')

      const names = afterRequest.body.map(elem => elem.name)

      assert.strictEqual(afterRequest.body.length, initialUsers.length)
      assert.strictEqual(!names.includes('Raven'), true)
    })

    test('no input for password fails with 400', async () => {
      const newUser = {
        'username': 'Azarath Metrion Zinthos',
        'name': 'Raven',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const afterRequest = await api.get('/api/users')

      const usernames = afterRequest.body.map(elem => elem.username)

      assert.strictEqual(afterRequest.body.length, initialUsers.length)
      assert.strictEqual(!usernames.includes('Azarath Metrion Zinthos'), true)
    })
  })
})

describe('Tests for DELETE request', () => {
  test('deleting user succeeds with 204', async () => {
    const response = await api.get('/api/users')
    const userToBeDeleted = response.body[0]

    await api
      .delete(`/api/users/${userToBeDeleted.id}`)
      .expect(204)

    const afterDeletion = await api.get('/api/users')

    const ids = afterDeletion.body.map(r => r.id)

    assert.strictEqual(!ids.includes(userToBeDeleted.id), true)
    assert.strictEqual(afterDeletion.body.length, initialUsers.length - 1)
  })
  test('invalid id fails with 404', async () => {
    await api
      .delete('/api/users/6814be3181f9192b4481fe52')
      .expect(404)

    const afterDeletion = await api.get('/api/users')

    assert.strictEqual(afterDeletion.body.length, initialUsers.length)
  })
})

describe('Tests for adding blogs', () => {
  test('adding valid Blog with User Id results in 201', async () => {
    const response = await api.get('/api/users')
    const user = response.body[0]
    const destination = user.id

    const newBlog = {
      title: 'test',
      author: 'author',
      url: 'url',
      userId: destination
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const afterSending = await api.get('/api/users')
    const userAfterSending = afterSending.body[0]

    const blogList = userAfterSending.blogs.map(r => r.title)

    assert.strictEqual(userAfterSending.blogs.length, user.blogs.length + 1)
    assert.strictEqual(blogList.includes('test'), true)
  })

  test('adding  Blog without User Id results in 400', async () => {
    const blogs = await api.get('/api/blogs')

    const newBlog = {
      title: 'test',
      author: 'author',
      url: 'url',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const afterSending = await api.get('/api/blogs')

    assert.strictEqual(afterSending.length, blogs.length)
  })
})


after(async () => {
  await mongoose.connection.close()
})