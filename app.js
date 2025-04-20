const express = require('express')
const mongoose = require('mongoose')
const { MONGODB_URI } = require('./utils/config')
const { info, err } = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')

const app = express()

info('establishing connection to', MONGODB_URI)

;(async () => {
  try {
    // eslint-disable-next-line no-unused-vars
    const result = await mongoose.connect(MONGODB_URI)
    info('connected to MongoDB')
  } catch (error) {
    err('error connecting to MongoDB', error.message)
  }
})()

app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app