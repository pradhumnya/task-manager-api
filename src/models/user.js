const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
//middleware as a way to customize the behavior of your Mongoose model. In order to take advantage of the middleware functionality we need to convert the object passed in user to a schema which is exactly done by mongoose if we don't pass the schema as such into the model

const userSchema = new mongoose.Schema({ //here User in quotes is the name of the collecction that we are using. Mongoose will take the collection name you provide and lowercase it and pluralize it for you in MongoDB.
    name: {
        type: String,
        required: true,
        trim: true 
    },
    email: {
        type: String,
        required: true,
        unique: true, //so that there cannot be two same email ids
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
    },
    age: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error('Enter a valid password!') 
            }
        }
    },
    tokens: [{ //array of objects. Done to store all the tokens generated for a user so that it can access multiple devices and log out of the ones currently logged in
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer // we store the binary image data so that when we deploy to the platform image don't get erased up
    }
},{
    timestamps: true
})

//Here we setup a virtual property which helps us in establishing a relationship between two entities. Here taskkk and user. We are not changing what we are going to store in the document 
//It is just a way for mongoose to decide how the two entities are related
userSchema.virtual('tasks', {
    ref: 'Task', //Here name should be the same name as the model's name
    localField: '_id',
    foreignField: 'owner'
})
userSchema.methods.generateAuthToken = async function() { //this schema for indivisual user
    const user = this
    const token = jwt.sign({ id: user.id}, process.env.JWT_SECRET)
    // console.log(user.id, user._id) //both return the same value
    user.tokens = user.tokens.concat({ token})
    await user.save()
    return token
}
userSchema.methods.toJSON = function() { //can use getPublicProfile and then add the method to the user 
    const user = this
    const userObject = user.toObject()  // gives back a raw object with the user data attached
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
userSchema.statics.findByCredentials = async (email, password) => { //this is for all 'User'
    const user = await User.findOne({email: email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

//Hash the plain text
userSchema.pre('save', async function (next) { //this function will run before save function
    const user = this //'this' give acccess to the indivisual user that is about to be saved or the document that is about to be saved
    // console.log('yto')
    if(user.isModified('password')){ //returns true when the password is updated or when new user is created and password is put
        user.password = await bcrypt.hash(user.password, 8)
    }
    next() //This function is provided so that it knows when we havve finished running our code before the user is saved
})
//Delete the tasks of the user when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id})
    next()
})
const User =  mongoose.model('User', userSchema)

module.exports = User