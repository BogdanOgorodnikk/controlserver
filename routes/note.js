const Router = require('koa-router')
const router = new Router()
const Note = require('../models/Note')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/note', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const notes = await sequelize.query(
            `SELECT * FROM notes
            ORDER BY id`
        )
        return ctx.body = notes[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.get('/api/allnote', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const notes = await sequelize.query(
            `SELECT * FROM notes
            ORDER BY id`
        )
        return ctx.body = notes[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/note', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const note = await Note.create({
            name: name
        })

        const newNote = await sequelize.query(
            `SELECT * FROM notes
            where notes.id = ${note.id}`
        )

        return ctx.body = newNote[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/note/:id', authMiddleware, async ctx => {
    const {name} = ctx.request.body
    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const note = await Note.update(
            {name: name},
            {where: {id: ctx.params.id}}
        )

        const newNote = await sequelize.query(
            `SELECT * FROM notes
            where notes.id = ${ctx.params.id}`
        )

        return ctx.body = newNote[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.delete('/api/note/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }
        const note = await Note.destroy({
            where: {
                id: ctx.params.id
            }
        })
        return ctx.body = note
    } catch (e) {
        return ctx.body = e
    }
})

module.exports = router