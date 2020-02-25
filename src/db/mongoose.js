const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
//Models are fancy constructors compiled from Schema definitions. An instance of a model is called a document. 
//Models are responsible for creating and reading documents from the underlying MongoDB database.
// const User =  mongoose.model('User', { //here User in quotes is the name of the collecction that we are using. Mongoose will take the collection name you provide and lowercase it and pluralize it for you in MongoDB.
//     name: {
//         type: String,
//         required: true,
//         trim: true 
//     },
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true,
//         validate(value) {
//             if(!validator.isEmail(value)){
//                 throw new Error('Email is invalid!')
//             }
//         }
//     },
//     age: {
//         type: Number,
//         default: 0
//     },
//     password: {
//         type: String,
//         required: true,
//         trim: true,
//         minlength: 6,
//         validate(value) {
//             if(value.toLowerCase().includes('password')){
//                 throw new Error('Enter a valid password!') 
//             }
//         }
//     }
// })

// const me = new User({
//     email: 'a@b.mn',
//     name: 'Jenkyyfdhgffcfol',
//     password: 'pass45689',
//     age: '40', //here age can be typecasted to integer even if entered as a string
// })

// me.save().then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log('Error',error)
// })

// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })

// const t = new Task({
//     description: 'Do',
//     // completed: true
// })

// t.save().then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log('Error', error)
// })