//Gets the express app running but what it does is defined in the routers
const express = require('express')
require('./db/mongoose.js')
const User = require('./models/user.js') //no need to add .js extension
const Task = require('./models/task.js')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()
const port = process.env.PORT 

// app.use((req, res, next) => {
//     // console.log(req.method, req.path)  //req.method returns the method used in the request and req.path returns the path
//     //code to disable GET requests
//     if(req.method === 'GET'){
//         res.send('GET requests are disabled')
//     }else{
//         next()
//     }
//     // next() //if next is not used then the request will never reach the specified route handler
// })

//Middleware for maintainence mode of the site
// app.use((req, res, next) => {
//     if(req.method){
//         res.status(503).send('Site is under Maintainence. Please try back again')
//     }
    
// })

//Middleware should be above these. With Middleware: new request --> do something --> route handler
app.use(express.json()) //used to parse the incoming data and use it to create new user in the req handler
app.use(userRouter)
app.use(taskRouter)
// const router = new express.Router()
// router.get('/test', (req,res) => res.send('This is a test case'))
// app.use(router)//registering the router with our express app

const multer = require('multer') //multer = multipart. Express doesn't support file uploads but this npm library allows use to do so with express
const upload = multer({
    dest: 'images', //destination of uploads
    limits: 10000000,
    fileFilter(req, file, cb) {
        if(!file.originalname.endsWith('.pdf')){  //orignalname returns name of the file on the user's computer
            return cb(new Error('Please upload a PDF format file'))
        }
        if(!file.originalname.match(/\.(doc|docx)/)){  // used to reject files that are not doc or docx
            return cb(new Error('Please upload a DOC format file'))
        }
    }
})
app.post('/uploads', upload.single('upload'), (req,res) => {  //multer provides middleware. whatever string is passed is passed in single should be the name of key in postman
    res.send('sent')
})




// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken') 
// const myFunction = async () => {
//     const token = jwt.sign({ _id: 'abc123'} , 'this is a token', { expiresIn: '1 seconds'}) //used to create a new json web token. The first argument is an object which contains the data that is going to be embedded in your token. So here we store an unique identifier for the user who is being authenticated
//                             //The second argument is a string which is a secret which is used to sign the token and ensures that the token hasn't been tampered or altered with. All we do here is to provide a random set pof characters
//     console.log(token)  // The token received has 3 parts seperated by '.'. The first part is the header which is a base64 encoded json string. It contains some meta information about the type of token it is.
//                         //The 2nd part is also a base64 encoded json. It which is called payload or the body. It contains ddata that we have provided. In this case the id.
//                         //the 3rd part contains the signature which is used to verify the token. The id is publicy viewable to anyone ho has the ttoken and is not a secret
//     const data = jwt.verify(token, 'this is a token') //Used to verify the token. 1st argument is the token and 2nd is the secret. Returns the payload if things go well
//     console.log(data)

    
    
//     // const password = 'User12345'
//     // const hashed = await bcrypt.hash(password, 8) //the number represents the no of times the hashing algorithm is executed. We have to maintain a balance between speed and security. That is why 8 is a good number.
//     // console.log(password, hashed)

//     // const isMatch = await bcrypt.compare('User12345', hashed) //compares the value with the stored hashed value and returns true or false. (return type is a promise)
//     // console.log(isMatch)
// }
//Hashing algorithms are a one way algorithms unlike encryption algorithms. The value hashed can't be reverted to orignal value. 
//In encryption algorithms we can retrace the orignal value using the encryption algo used
// myFunction()

app.listen(port, () => {
    console.log('Server is up at ' + port)
})


// const cat = {
//     name: 'bill'
// }
// cat.toJSON = function(){
//     console.log(this)   //We can manipulate what is to  be sent back by stringify by json through this.
//     return this
//     // return {} //We manipulate the object to send back only the properties that we want

// }
// console.log(JSON.stringify(cat)) //to convert to JSON

// const main = async () => {
//     const task = await Task.findById('5e50357613114195e8d69a1f')
//     await task.populate('owner').execPopulate() //populate allows us to populate data for a relationship. Here we pass owner to bring it from just being an id to an entire profile.
//     //the above line is gonna find the user associated with the task and task.owner is going to be the entire profile 
//     console.log(task.owner) //finding the owner of the task
//     const user = await User.findById('5e5034e9cc734b13d0b49e1d')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks) //finds all the tasks made by the user
// }
// main()