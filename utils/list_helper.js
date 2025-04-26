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
  const groupedByAuthor = lodash.groupBy(blogs, 'author')

  const authorBlogCounts = Object.keys(groupedByAuthor).map(author => ({
    author: author,
    blogs: groupedByAuthor[author].length
  }))

  return lodash.maxBy(authorBlogCounts, 'blogs')
}

const mostLikes = (blogs) => {
  const groupedByAuthor = lodash.groupBy(blogs, 'author')

  const authorLikeCount = Object.keys(groupedByAuthor).map((author) => ({
    author,
    likes: Object.keys(lodash.groupBy(groupedByAuthor[author], 'likes')).map(num => parseInt(num)).reduceRight((acc, cur) => acc + cur, 0)
  }))

  return lodash.maxBy(authorLikeCount, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}