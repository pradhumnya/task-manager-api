const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'mike@example.com',
    password: '234qwerty!',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)   
    }]
}

beforeEach(async () => {
    await User.deleteMany()  //we wipe the data in database as email id can't be registered twice
    await new User(userOne).save()
})

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: "Lenna",
        email: "lenna@example.com",
        password: "Pass12345"
    }).expect(201)

    //Check that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    //check about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Lenna',
            email: 'lenna@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('Pass12345')  //check whethet the password is hashed or not
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    console.log(response.body)
    expect(user).not.toBeNull()
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'ncnkjknnjdnaq'
    }).expect(400)
})

test('Should get profile for user', (done) => {
    request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    done()
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for User', (done) => {
    const response = request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    // console.log(response)
    done()
    const user = User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})
