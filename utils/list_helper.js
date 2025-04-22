const lodash = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let total = 0
  blogs.forEach(element => {
    total += element.likes
  })
  return total
}

const favoriteBlog = (blogs) => {
  blogs.sort((a, b) => a.likes - b.likes)
  let favorite = blogs[blogs.length - 1]
  return favorite
}

const mostBlogs = (blogs) => {
  let authors = []
  lodash.uniqBy(blogs, 'author').forEach(element  => {
    authors.push(element.author)
  })

  let ordered = []
  authors.forEach(element => {
    ordered.push(blogs.filter(elem => elem.author === element))
  })

  ordered.sort((a, b) => a.length - b.length)

  const most = {
    author: ordered[ordered.length - 1][0].author,
    blogs: ordered.length
  }
  return most
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}