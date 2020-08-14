const mongoose = require('mongoose')
const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const Person = require("./model/user.modul.js")
require('dotenv').config()

const app = new Koa();
const router = new Router();
app.use(bodyparser());

router.post('/create', async (ctx, next)=>{
    const {email, password} = ctx.request.body
    try{
        const candidat =await Person.findOne({email})
        console.log(candidat)
        if(!candidat){
            const user = new Person({
                email,
                password
            })
            await user.save()
            ctx.body = await 'create user'
        }
            
        ctx.body = await password
    }catch(err){
        ctx.status = 400;
        ctx.body = err;
    }
})
app.use(router.routes()); 
const server = app.listen(3000);

mongoose.connect(process.env.db,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log('connect to mongoDB')).catch(e => console.log(e))

