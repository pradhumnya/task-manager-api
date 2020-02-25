const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

// router.get('/test', (req,res) => res.send('This is a test case'))
router.post('/users', async (req,res) => {
    // res.send('Testing!')
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})   //written in shorthand syntax

    } catch (e) {
        res.status(400).send(e)
    }
    // user.save().then((result) => {
    //     res.send(user)
    // }).catch((error) => {
    //     res.status(400).send(error) //changing the status to 400 from 200 so that the user can now that it is a client side error
    // })
    
})
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user , token})
        // res.send({user: user.getPublicProfile(), token}) //here when res is sending the data it is in JSON format
    } catch (e) {
        res.status(400).send()
    }
})
router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token  //token that was used is thrown out. here tokens is an array of objects. token is a varial to access each object and then after that token is used again to access the property
        })
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})
router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user)
    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // }catch (e) {
    //     res.status(500).send(e)
    // }
    // User.find({}).then((users) => { //{} returns all the documents in the collection
    //     res.send(users)
    // }).catch((error) => {
    //     res.status(500).send(error)
    // }) 
})

const upload = multer({
    // dest: 'avatars',  //removed so that the multer middleware passess on the file to our function and we can store it in buffer form
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) { //used to reject files that we don't want to be uploaded
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
            return cb(new Error('Please upload a jpeg, jpg or png format image'))
        }
        cb(undefined, true)
    }
    
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()  //resizes and converts to png 
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {  //We have added anpother function in case an errror is thrown. In this instead of displaying the entire error only the error that yoou have typed is shown
    res.status(400).send({error: error.message})
})
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})
router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error
        }
        res.set('Content-Type', 'image/png') //response headers
        res.send(user.avatar)
    
    }catch (e) {
        res.status(404).send()
    }
})
// router.get('/users/:id', async (req, res) => {
//     const id = req.params.id   // We don't have to convert the id from string to object. Mongoose does this itself unlike while using native MongoDB driver
//     try{
//         const users = await User.findById(id)
//         if(!users){
//             return res.status(400).send('Id not found')
//         }
//         res.send(users)
//     }catch (e) {
//         res.status(500).send(e)
//     }
//     // User.findById(id).then((user) => {
//     //     if(!user){
//     //         return res.status(400).send('Id not found')
//     //     }
//     //     res.send(user)
//     // }).catch((e) => {
//     //     res.status(500).send()

//     // })
//     //console.log(req.params)
// })
router.patch('/users/me', auth,  async (req, res) => {
    const updates = Object.keys(req.body) //returns an array of strings where each string is the value of the property on that object
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => { //updates.every((update) => allowedUpdates.includes(update)) shorthand syntax
        return allowedUpdates.includes(update)
    })
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid update operation!!'})
    }
    try{
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true}) //new ensures that the returned object to us is with all the current updates made. runValidators ensures that the data entered is valid
        //findByIdAndUpdate bypasses mongoose's advance functionality like middleware so we have to do it in a mmore traditional mongoose way
        // const user = await User.findById(req.params.id) //we have access to the instance of the user model
        const user = req.user
        updates.forEach((update) => { //updates is an array of string
            user[update] = req.body[update] //we'll use bracket notation to access a property dynamically in this case we're accessing the property whose name it comes from the update variable.
        })
        await user.save() //before this the middleware gets activated
        // if(!user){
        //     return res.status(404).send()
        // }
        
        res.send(user)
    }catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req,res) => {
    try{
        // const user = await User.findByIdAndDelete(req.params.id) //req.user._id
        // if(!user){
        //     return res.status(404).send('No User found')
        // }
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)

    }catch (e){
        res.status(500).send(e)
    }
})

module.exports = router