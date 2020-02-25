const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to: 'mepradhumnya@gmail.com',
//     from: 'myrdaemons@gmail.com',
//     subject: 'This is my first creation',
//     text: 'Yolo Lit af'
// })
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'myrdaemons@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Hello ${name}, Let me how to get along the app`  //back ticks used here so that we can easily use variable within the text
    })
}
const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mepradhumnya@gmail.com',
        subject: 'Do not come back again',
        text: `Hey ${name}, you are no longer needed.`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}