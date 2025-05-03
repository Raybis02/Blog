const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const entries = await Blog.find({}).populate('user')
    if (entries) {
      response.json(entries)
    } else
      return response.status(404).send('<h1>Error 404 Page Not Found</h1><p>Database does not exist</p>')
  } catch (error) {
    next(error)
  }
})

blogsRouter.get('/:id', async (request, response, next) => {
  const id = request.params.id

  try {
    const entry = await Blog.findById(id)
    if (entry)
      response.json(entry)
    else
      return response.status(404).send(`<h2>404 Page Not Found</h2> <p>there is no entry for a blog with id ${id}</p>`).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  try {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      user: request.user._id,
      likes: body.likes,
    })

    const savedBlog = await blog.save()
    request.user.blogs = request.user.blogs.concat(savedBlog._id)
    await request.user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id

  try {
    const blog = await Blog.findById(id)

    if (!blog) {
      return response.status(404).json({ error: 'Entry no found' })
    } else if (blog.user.toString() !== request.user.id.toString()) {
      return response.status(400).json({ error: 'only creators can delete their blogs' })
    }
    request.user.blogs = request.user.blogs.filter(blogId => blogId.toString() !== id)
    await request.user.save()
    await Blog.findByIdAndDelete(id)
    response.status(204).end()

  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id
  const body = request.body

  if (!body.title || body.title.trim() === '' || !body.author || body.author.trim() === '' || !body.url || body.url.trim() === '' || body.likes === undefined) {
    return response.status(400).json({ error: 'all fields need value' })
  }

  const entry = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  try {
    const updatedEntry = await Blog.findByIdAndUpdate(id, entry, { new: true, runValidators: true })
    if (!updatedEntry) {
      return response.status(404).json({ error: 'Entry not found' })
    }
    response.json(updatedEntry)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter