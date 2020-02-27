const {calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add} = require('../math') 
test('Total with tip', () => {
    const total = calculateTip(10, 0.3)
    expect(total).toBe(13)  //toBe checks for equality
})
test('Total with default tip', () => {
    const total = calculateTip(10)
    expect(total).toBe(12)
}) 
test('Convert 32F to 0C', () => {
    const con = fahrenheitToCelsius(86)
    expect(con).toBe(30)
})
test('Convert 0C to 32F', () => {
    const con = celsiusToFahrenheit(0)
    expect(con).toBe(32)
})
// test('Asynchronous testing', (done) => { //done is called here so that jest can know that this is an asynchronous function. Otherwise the output of the following function would have been passed as jest would not have waited for the setTimeOut
//     setTimeout(() => {
//         expect(1).toBe(2)
//         done()
//     },2000)
// })

test('add', async () => {
    const sum = await add(2,5)
    expect(sum).toBe(7)
})