import express from 'express'
import { PORT, SECRET_JWT_KEY } from './config-env.js'
import { UserRepository } from './user-repository.js'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

const app = express()
app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())

// all requests pass through here
app.use((req, res, next) => {
  const token = req.cookies.access_token
  req.session = { user: null }
  if (token) {
    try {
      const data = jwt.verify(token, SECRET_JWT_KEY)
      req.session.user = data
    } catch (err) {
      console.log(err)
    }
  }
  next()
})

app.get('/', (req, res) => {
  const { user } = req.session
  res.render('index', user)
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_JWT_KEY,
      {
        expiresIn: '1h'
      }
    )
    // create a second token por refresh
    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60
      })
      .send({ user })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
})

app.post('/register', async (req, res) => {
  if (!req.body) return res.status(400).send({ message: 'body do not exist' })
  const { username, password } = req.body

  try {
    const id = await UserRepository.create({ username, password })
    console.log({ id })
    res.send({ message: 'user created' })
  } catch (err) {
    console.log(err.message)
    res.status(400).send({ message: err.message })
  }
})

app.get('/protected', (req, res) => {
  const { user } = req.session
  if (!user) return res.status(403).send('access not authorized')
  res.render('protected', user)
})

app.post('/logout', (req, res) => {
  res
    .clearCookie('access_token')
    .json({ message: 'Logout successful' })
})

app.listen(PORT, () => {
  console.log(`Server is listening in http://localhost:${PORT}`)
})
