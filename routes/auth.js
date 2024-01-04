const Router = require('koa-router')
const router = new Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const config = require('../config')
const authMiddleware = require('../middleware/auth.middleware')
const {format} = require("date-fns");

router.post('/api/register', async (ctx) => {
    const {login, password} = ctx.request.body;
    try {
        if(validator.isEmpty(login, {ignore_whitespace: true}) == true
            || validator.isLength(login, {min: 2, max: 32}) == false) {
            return ctx.body = 'error login'
        } else if (validator.isEmpty(password, {ignore_whitespace: true}) == true
            || validator.isLength(password, {min: 6, max: 32}) == false) {
            return ctx.body = 'error password'
        }

        const candidate = await User.findOne({
            where: {
                login: login.replace(/\s/g, '')
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

        if(format(new Date(), 'HH') >= 9 && format(new Date(), 'HH') <= 20 && user.count >= 3) {
            await User.update(
                {count: 0, ban: false},
                {where: {id: user.id}}
            )
        } else if(user.count >= 3) {
            return ctx.status = 400;
        }

        if(!isPassValid) {
            await User.update(
                {count: user.count + 1, ban: user.count + 1 >= 3},
                {where: {id: user.id}}
            )

            return ctx.status = 400;
        }

        await User.update(
            {count: 0, ban: false},
            {where: {id: user.id}}
        )

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