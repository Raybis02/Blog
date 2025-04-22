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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}