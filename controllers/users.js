const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')

userRouter.get('/', async (request, response, next) => {
  try {
    const entries = await User.find({}).populate('blogs', 'url title author')
    if (entries) {
      response.json(entries)
    } else
      return response.status(404).send('<h1>Error 404 Page Not Found</h1><p>Database does not exist</p>')
  } catch (error) {
    next(error)
  }
})

userRouter.get('/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const entry = await User.findById(id)
    if (entry) {
      response.json(entry)
    } else {
      response.status(404).json({ error: `Entry with id: ${id} does not Exist` })
    }
  } catch (error) {
    next(error)
  }
})

userRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  if(!username || !password){
    return response.status(400).json({ error: 'Username or Password missing' })
  }

  if (password.length < 3) {
    return response.status(400).json({ error: 'Password too short. min length is 3' })
  }
  try {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)

  } catch (error) {
    next(error)
  }
})

userRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const userToBeDeleted = await User.findByIdAndDelete(id)
    if(!userToBeDeleted) {
      return response.status(404).json({ error: `Entry with id: ${id} not found` })
    }
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = userRouter