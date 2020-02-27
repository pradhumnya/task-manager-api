const express = require('express')
require('./db/mongoose.js')
// const User = require('./models/user.js') //no need to add .js extension
// const Task = require('./models/task.js')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()

app.use(express.json()) //used to parse the incoming data and use it to create new user in the req handler
app.use(userRouter)
app.use(taskRouter)

module.exports = app