const mongoose = require('mongoose')
const Koa = require('koa')
const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const bodyparser = require('koa-bodyparser')
const {compareSync, hashSync,genSaltSync} = require('bcrypt-nodejs') 
const Person = require("./model/user.modul.js")
require('dotenv').config()
const axios = require('axios')
const jwtMiddleware = require('koa-jwt')

const app = new Koa();
const router = new Router();
app.use(bodyparser());

router.post('/create', async (ctx, next)=>{
    const {email, password} = ctx.request.body
    const salt = genSaltSync(10)
    try{
        const candidat = await Person.findOne({email})
        
        if(candidat){
            ctx.body = "Користувач уже є в мережі";
        }else{
            const user = new Person({
                email,
                password : hashSync(password, salt)
            })
            await user.save()
            ctx.body = "Користувач успішно створений";
        }
    }catch(err){
        ctx.status = 400;
        ctx.body = err;
    }
})
router.post('/login', async (ctx, next)=>{
    const {email,password} = ctx.request.body
    try{
        const candidat = await Person.findOne({email})
        if(!candidat){

            ctx.body = 'Користувач не знайдений'
        }else{
            const isPasswordCorrect = compareSync(password, candidat.password)
            if(isPasswordCorrect){
                const token = jwt.sign({
                    email:candidat.email,
                },process.env.secret,{expiresIn: 3600*24})
                ctx.body = token
            }
            
        }
        
    }catch(err){
        ctx.status = 400;
        ctx.body = err;
    }
})

router.get('/post/:id',jwtMiddleware({secret: process.env.secret}), async(ctx, next )=>{
    const {id} = ctx.params
   await axios({
        method: 'get',
        url: `https://jsonplaceholder.typicode.com/posts/${id}`
    }).then(result => {
    ctx.body = result.data}).catch(e => console.log(e))
})
router.get('/verify', async (ctx)=>{
    const headers = ctx.headers.authorization
    const token = headers.replace("Bearer ", "")
    try{
    if(token === ""){
        ctx.body = 'token not found'
    }
        const obj = jwt.verify(token, process.env.secret)
        ctx.body = {message: 'ok', payload : obj}
        }catch(e){
        ctx.body = e
        }    
})
app.use(router.routes()); 
const server = app.listen(3000);

mongoose.connect(process.env.db,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log('connect to mongoDB')).catch(e => console.log(e))

