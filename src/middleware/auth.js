const jwt = require('jsonwebtoken')
const User = require('../models/user') 

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        // console.log(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded.id, 'tokens.token': token}) //find a user with correct id who has the authentication token
        // console.log(decoded.id) //gives the id of the token object
        // console.log(user)
        if(!user){
            throw new Error() //no need to provide as it will automatically trigger catch
        }
        req.token = token
        req.user = user
        next()
    }catch (e) {
        res.status(401).send({error: 'Please authenticate'})
    }
    // console.log('Auth Middleware')
}

module.exports = auth