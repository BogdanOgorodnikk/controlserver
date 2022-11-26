const Router = require('koa-router')
const router = new Router()
const ClientNote = require('../models/Client_note')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/client-note/:client_id', authMiddleware, async ctx => {
    const client_id = ctx.params.client_id

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const notes = await sequelize.query(
            `SELECT client_notes.id, client_notes.description, client_notes.creater_id,
                client_notes.data_create, users.login as createrName
             FROM client_notes
             LEFT JOIN users ON client_notes.creater_id = users.id
             WHERE client_id = ${client_id}`
        )
        return ctx.body = notes[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/client-note', authMiddleware, async ctx => {
    const {description, client_id} = ctx.request.body

    try {
        if(ctx.user.role_id < 1 || ctx.user.role_id > 5 && ctx.user.ban == 1) {
            return ctx.status = 400
        }

        const note = await ClientNote.create({
            description: description,
            client_id,
            creater_id: ctx.user.id,
            data_create: new Date()
        })

        const newNote = await sequelize.query(
            `SELECT client_notes.id, client_notes.description, client_notes.creater_id,
                client_notes.data_create, users.login as createrName
             FROM client_notes
             LEFT JOIN users ON client_notes.creater_id = users.id
             WHERE client_notes.id = ${note.id}`
        )

        return ctx.body = newNote[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/client-note', authMiddleware, async ctx => {
    const {description, id} = ctx.request.body

    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        await ClientNote.update(
            {
                description: description,
            },
            {where: {id: id}}
        )

        const newNote = await sequelize.query(
            `SELECT client_notes.id, client_notes.description, client_notes.creater_id,
                client_notes.data_create, users.login as createrName
             FROM client_notes
             LEFT JOIN users ON client_notes.creater_id = users.id
             WHERE client_notes.id = ${id}`
        )

        return ctx.body = newNote[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/client-note/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }


        const comment = await ClientNote.destroy({
            where: {
                id: ctx.params.id
            }
        })

        return ctx.body = comment
    }
    catch(e) {
        return ctx.body = e
    }
})

module.exports = router