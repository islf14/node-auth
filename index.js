import express from 'express'
import { PORT } from './config.js'
import { UserRepository } from './user-repository.js'

const app = express()
app.set('view engine', 'ejs')
app.use(express.json())

app.get('/', (req, res) => {
  res.render('protected', { username: 'hi world' })
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })
    res.send({ user })
  } catch (err) {
    res.status(400).send({ message: err.message })
  }
})

app.post('/register', async (req, res) => {
  if (!req.body) {
    res.status(400).send('body do not exist')
  }
  const { username, password } = req.body

  try {
    const id = await UserRepository.create({ username, password })
    console.log({ id })
    res.send({ message: 'user created' })
  } catch (err) {
    res.status(400).json({ message: err.message })
    // return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
})

app.post('/logout', (req, res) => { })

app.get('/protected', (req, res) => { })

app.listen(PORT, () => {
  console.log(`Server is listening in http://localhost:${PORT}`)
})
