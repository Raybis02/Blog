require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')

const app = express()

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = process.env.MONGODB_URI

console.log('establishing connection to',mongoUrl)

;(async () => {
  console.log('smd')
  try {
    const result = await mongoose.connect(mongoUrl)
    console.log('connected to MongoDB')
  } catch (error) {
    console.log('error connecting to MongoDB', error.message)
  }
})()

app.use(express.json())

app.get('/api/blogs', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
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
      return response.status(404).json( { error: 'Entry no found' } )
    }
    response.status(204).end()

  } catch (error) {
    next(error)
  }

})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})