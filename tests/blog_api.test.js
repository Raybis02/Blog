const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

const api = supertest(app)

const initialUsers = []


const initializeUsers = async () => {
  const saltRounds = 10
  const users = [
    {
      username: 'Socrates',
      name: 'Marshall Cuso',
      passwordHash: await bcrypt.hash('socrates', saltRounds)
    },
    {
      username: 'Tiger Philanthropist',
      name: 'Steven Universe',
      passwordHash: await bcrypt.hash('steven', saltRounds)
    },
    {
      username: 'Levi',
      name: 'Azi',
      passwordHash: await bcrypt.hash('azi', saltRounds)
    }
  ]
  initialUsers.push(...users)
}

initializeUsers()

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
  await User.deleteMany({})
  await User.insertMany(initialUsers)
})

test('correct number of blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('unique identifier is id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(elem => {
    assert.strictEqual(Object.keys(elem).includes('id'), true)
    assert.strictEqual(Object.keys(elem).includes('_id'), false)
  })
})

describe('tests for POST request', () => {
  test('Valid POST results in 201', async () => {
    const newBlog = {
      title: 'Tiger Philanthropist',
      author: 'Steven Universe',
      url: 'https://www.imdb.com/title/tt5969422/?ref_=ttep_ep_18',
      likes: 18,
    }

    const userToLogin = {
      username: 'Socrates',
      password: 'socrates',
    }

    const fetchToken = await api
      .post('/api/login')
      .send(userToLogin)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = fetchToken.body.token

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length + 1)

    const afterSending = response.body.map(elem => elem.title)
    assert(afterSending.includes('Tiger Philanthropist'))
  })

  test('Invalid POST without token results in 401', async () => {
    const newBlog = {
      title: 'Tiger Philanthropist',
      author: 'Steven Universe',
      url: 'https://www.imdb.com/title/tt5969422/?ref_=ttep_ep_18',
      likes: 18,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)

    const afterSending = response.body.map(elem => elem.title)
    assert(!afterSending.includes('Tiger Philanthropist'))
  })

  test('default value of likes is 0', async () => {
    const newBlog = {
      title: 'Tiger Philanthropist',
      author: 'Steven Universe',
      url: 'https://www.imdb.com/title/tt5969422/?ref_=ttep_ep_18',
    }

    const userToLogin = {
      username: 'Socrates',
      password: 'socrates',
    }

    const fetchToken = await api
      .post('/api/login')
      .send(userToLogin)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = fetchToken.body.token

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const afterSending = response.body.find(element => element.title === newBlog.title)
    assert.strictEqual(afterSending.likes, 0)
  })

  test('Bad Request when title or url are missing', async () => {
    const noTitle = {
      author: 'Steven Universe',
      url: 'https://www.imdb.com/title/tt5969422/?ref_=ttep_ep_18',
    }
    const userToLogin = {
      username: 'Socrates',
      password: 'socrates',
    }

    const fetchToken = await api
      .post('/api/login')
      .send(userToLogin)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = fetchToken.body.token

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(noTitle)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const afterSending = await api.get('/api/blogs')
    assert.strictEqual(afterSending.body.length, initialBlogs.length)

    const noUrl = {
      title: 'Tiger Philanthropist',
      author: 'Steven Universe',
    }
    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(noUrl)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const afterSending2 = await api.get('/api/blogs')
    assert.strictEqual(afterSending2.body.length, initialBlogs.length)

    const notBoth = {
      author: 'Steven Universe',
    }
    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(notBoth)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const afterSending3 = await api.get('/api/blogs')
    assert.strictEqual(afterSending3.body.length, initialBlogs.length)
  })
})

describe('Tests for DELETE request', () => {
  test('Valid delete request with token succeeds with code 204', async () => {
    const newBlog = {
      title: 'Tiger Philanthropist',
      author: 'Steven Universe',
      url: 'https://www.imdb.com/title/tt5969422/?ref_=ttep_ep_18',
      likes: 18,
    }

    const userToLogin = {
      username: 'Socrates',
      password: 'socrates',
    }

    const fetchToken = await api
      .post('/api/login')
      .send(userToLogin)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = fetchToken.body.token

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const blogToDelete = response.body.filter(elem => elem.title === 'Tiger Philanthropist')[0]
    console.log(blogToDelete)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .auth(token, { type: 'bearer' })
      .expect(204)

    const afterDeletion = await api.get('/api/blogs')

    const ids = afterDeletion.body.map(r => r.id)
    assert.strictEqual(ids.includes(blogToDelete.id), false)
    assert.strictEqual(afterDeletion.body.length, response.body.length - 1)
  })

  test('invalid delete request without token fails with code 401', async () => {
    const newBlog = {
      title: 'Tiger Philanthropist',
      author: 'Steven Universe',
      url: 'https://www.imdb.com/title/tt5969422/?ref_=ttep_ep_18',
      likes: 18,
    }

    const userToLogin = {
      username: 'Socrates',
      password: 'socrates',
    }

    const fetchToken = await api
      .post('/api/login')
      .send(userToLogin)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = fetchToken.body.token

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const blogToDelete = response.body.filter(elem => elem.title === 'Tiger Philanthropist')[0]
    console.log(blogToDelete)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const afterDeletion = await api.get('/api/blogs')

    const ids = afterDeletion.body.map(r => r.id)
    assert.strictEqual(ids.includes(blogToDelete.id), true)
    assert.strictEqual(afterDeletion.body.length, response.body.length)
  })
})

// describe('Tests for PUT request', () => {
//   test('put request results in code 200 for valid input', async () => {
//     const response = await api.get('/api/blogs')

//     const blogToBeChanged = response.body[0]
//     blogToBeChanged.likes = 100

//     await api
//       .put(`/api/blogs/${blogToBeChanged.id}`)
//       .send(blogToBeChanged)
//       .expect(200)
//       .expect('Content-Type', /application\/json/)

//     const response2 = await api.get('/api/blogs')
//     const afterPut = response2.body[0]
//     assert.strictEqual(afterPut.likes, blogToBeChanged.likes)
//   })

//   test('put request results in code 400 for invalid input', async () => {
//     const response = await api.get('/api/blogs')

//     const blogToBeChanged = response.body[0]
//     const title = blogToBeChanged.title
//     blogToBeChanged.title = ''

//     await api
//       .put(`/api/blogs/${blogToBeChanged.id}`)
//       .send(blogToBeChanged)
//       .expect(400)
//       .expect('Content-Type', /application\/json/)

//     const response2 = await api.get('/api/blogs')
//     const afterPut = response2.body[0]
//     assert.strictEqual(afterPut.title, title)
//   })
// })

after(async () => {
  await mongoose.connection.close()
})