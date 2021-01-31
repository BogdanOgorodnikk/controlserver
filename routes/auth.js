const Router = require('koa-router')
const router = new Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/api/register', async (ctx) => {
    const {login, password} = ctx.request.body;
    
    try {
        const candidate = await User.findOne({
            where: {
                login: login
            }
        })
        
        if(candidate) {
            return ctx.status = 400;
        } else {
            const hash = await bcrypt.hashSync(password, 10);
            const newUser = await User.create({
                login,
                password: hash
            })
            ctx.body = newUser
        }
        

    } catch (e) {
        ctx.body = "Task does not exit" + e
    }
})

router.post('/api/login', async (ctx) => {
    try {
        const {login, password} = ctx.request.body;
        const user = await User.findOne({
            where: {
                login: login
            }
        })
        if(!user) {
            return ctx.status = 404;
        }
        const isPassValid = bcrypt.compareSync(password, user.password)
        if(!isPassValid) {
            return ctx.status = 400;
        }
        const token = jwt.sign({id: user.id, role_id: user.role_id, ban: user.ban}, config.SECRETKEY, {expiresIn: "1h"})
        return ctx.body = {
            token,
            user: {
                id: user.id,
                login: user.login,
                role_id: user.role_id,
                ban: user.ban
            }
        }
    } catch (e) {
        ctx.body = 'Task does not exist' + e
    }
})

router.get('/api/auth', authMiddleware, async (ctx) => {
    try {
        const user = await User.findOne({
            where: {
                id: ctx.user.id
            }
        })
        const token = jwt.sign({id: user.id, role_id: user.role_id, ban: user.ban}, config.SECRETKEY, {expiresIn: "1h"})
        return ctx.body = {
            token,
            user: {
                id: user.id,
                login: user.login,
                role_id: user.role_id,
                ban: user.ban
            }
        }
    } catch (e) {
        ctx.body = 'Task does not exist' + e
    }
})

module.exports = router