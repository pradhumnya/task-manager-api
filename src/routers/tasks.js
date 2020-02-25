const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth,  async (req,res) => {
    // const task = new Task(req.body) //req.body provides us with the body of the request
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.send(task)
    }catch (e) {
        res.status(500).send()
    }
    // task.save().then((result) => {    //task and result on consoling out represent the same output. Though we should use result as we get that after the document is saved in the database.
    //     res.send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0  => show only first 10 results. limit=50&skip=10 => shows 50results after first 10 results 
// GET /tasks?sortBy=createdAt_asc => fieldname_asc or desc. : can be used instead of _
router.get('/tasks', auth, async (req,res) => {
    const match = {}
    const sort = {}
    // console.log(req.query.completed)
    if(req.query.completed){   ////req.query.completed provides with the value of completed in the url and it is returns a string true or false. So if statement judges if the length is 0 or not. if 0 if loop is not executed
        match.completed = req.query.completed === 'true'
    }  //if completed is mentioned in the request only then this will run otherwise all the tasks will be sent back
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 //-1 for desc and +1 for asc
    }
    try{
        // const tasks = await Task.find({owner: req.user._id})  //or anotyher way of doing that would be await req.user.populate('tasks').execPopulate() and res.send(req.user.tasks)
        await req.user.populate({
            path: 'tasks',
            match ,      //shorthand used here for match
            options: {      //options can be used for pagination ands orting
                limit: parseInt(req.query.limit),  //parseInt converts a number string into a int type and if it is not a number it ignores it
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)  // res.send(tasks) if find is used
    }catch (e) {
        res.status(400).send(e)
    }
    // Task.find({}).then((result) => {
    //     res.send(result)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
})
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try{
        // const tasks =  await Task.findById(id)
        const tasks = await Task.findOne({ _id, owner: req.user._id}) 
        if(!tasks){
            return res.send('Id not found')
        }
        res.send(tasks)
    }catch (e) {
        res.status(500).send(e)
    }
    // Task.findById(id).then((task) =>{
    //     if(!task){
    //         return res.send('Id not found')
    //     }
    //     res.send(task)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
})
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Update operation'})
    }
    try{
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        //const task = await Task.findByIdAndUpdate(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    }catch (e) {
        res.status(400).send(e)
    }
})
router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send('No such task found')
        }
        res.send(task)
    }catch (e){
        res.status(500).send()
    }
})

module.exports = router