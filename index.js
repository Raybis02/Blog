require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const { info, error } = require('./utils/logger')

const app = express()

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = process.env.MONGODB_URI

info('establishing connection to', mongoUrl)

;(async () => {
  try {
    // eslint-disable-next-line no-unused-vars
    const result = await mongoose.connect(mongoUrl)
    info('connected to MongoDB')
  } catch (err) {
    error('error connecting to MongoDB', err.message)
  }
})()

app.use(express.json())

app.get('/api/blogs', async (request, response, next) => {
  try {
    const entries = await Blog.find({})
    if (entries) {
      response.json(entries)
    } else
      response.status(404).send('<h1>Error 404 Page Not Found</h1><p>Database does not exist</p>')
  } catch (error) {
    next(error)
  }
})

app.get('/api/blogs/:id', async (request, response, next) => {
  const id = request.params.id

  try {
    const entry = await Blog.findById(id)
    if (entry)
      response.json(entry)
    else
      response.status(404).send(`<h2>404 Page Not Found</h2> <p>there is no entry for a blog with id ${id}</p>`).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

app.delete('/api/blogs/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const result = await Blog.findByIdAndDelete(id)
    if (!result) {
      return response.status(404).json({ error: 'Entry no found' })
    }
    response.status(204).end()

  } catch (error) {
    next(error)
  }
})

app.put('/api/blogs/:id', async (request, response, next) => {
  const id = request.params.id
  const body = request.body

  if ((body.title === '') || (body.author === '') || (body.url === '') || (body.likes === null)) {
    response.status(400).json({ error: 'all fields need value' })
  }

  const entry = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  try {
    const updatedEntry = await Blog.findByIdAndUpdate(id, entry, { new: true })
    if (!updatedEntry) {
      return response.status(404).json({ error: 'Entry not found' })
    }
    response.json(updatedEntry)
  } catch (error) {
    next(error)
  }

})

const PORT = 3003
app.listen(PORT, () => {
  info(`Server running on port ${PORT}`)
})