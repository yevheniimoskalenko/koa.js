const mongoose = require('mongoose')
const Koa = require('koa')
const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const bodyparser = require('koa-bodyparser')
const bcrypt = require('bcrypt-nodejs') 
const Person = require("./model/user.modul.js")
require('dotenv').config()

const app = new Koa();
const router = new Router();
app.use(bodyparser());

router.post('/create', async (ctx, next)=>{
    const {email, password} = ctx.request.body
    const salt = bcrypt.genSaltSync(10)
    try{
        const candidat = await Person.findOne({email})
        
        if(candidat){
            ctx.body = "Користувач уже є в мережі";
        }else{
            const user = new Person({
                email,
                password : bcrypt.hashSync(password, salt)
            })
            await user.save()
            ctx.body = "Користувач успішно створений";
        }
    }catch(err){
        ctx.status = 400;
        ctx.body = err;
    }
})
router.post('/login',async (ctx, next)=>{
    const {email,password} = ctx.request.body
    try{
        const candidat = await Person.findOne({email})
        if(!candidat){

            ctx.body = 'Користувач не знайдений'
        }else{
            const isPasswordCorrect = bcrypt.compareSync(password, candidat.password)
            if(isPasswordCorrect){
                const token = jwt.sign({
                    email:candidat.email,
                },process.env.secret,{expiresIn: 60*24})
                ctx.body = token
            }
            
        }
        
    }catch(err){
        ctx.status = 400;
        ctx.body = err;
    }
})
router.get('/verify', async (ctx, next)=>{
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

