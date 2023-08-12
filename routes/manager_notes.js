const Router = require('koa-router')
const router = new Router()
const ManagerNote = require('../models/Manager_note')
const { sequelize } = require('../database/db')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/api/manager-note/:manager_id', authMiddleware, async ctx => {
    const manager_id = ctx.params.manager_id


    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        if(ctx.user.role_id === 5 && ctx.user.id !== Number(manager_id)) {
            return ctx.status = 400
        }

        const notes = await sequelize.query(
            `SELECT manager_notes.id, manager_notes.description, manager_notes.creater_id,
                manager_notes.data_create, users.login as createrName
             FROM manager_notes
             LEFT JOIN users ON manager_notes.creater_id = users.id
             WHERE manager_id = ${manager_id}`
        )
        return ctx.body = notes[0]
    } catch (e) {
        return ctx.body = e
    }
})

router.post('/api/manager-note', authMiddleware, async ctx => {
    const {description, manager_id} = ctx.request.body

    try {
        if(ctx.user.role_id !== 1 && ctx.user.role_id !== 5 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        if(ctx.user.role_id === 5 && ctx.user.id !== manager_id) {
            return ctx.status = 400
        }

        const note = await ManagerNote.create({
            description: description,
            manager_id,
            creater_id: ctx.user.id,
            data_create: new Date()
        })

        const newNote = await sequelize.query(
            `SELECT manager_notes.id, manager_notes.description, manager_notes.creater_id,
                manager_notes.data_create, users.login as createrName
             FROM manager_notes
             LEFT JOIN users ON manager_notes.creater_id = users.id
             WHERE manager_notes.id = ${note.id}`
        )

        return ctx.body = newNote[0][0]
    } catch (e) {
        return ctx.body = e
    }
})

router.put('/api/manager-note', authMiddleware, async ctx => {
    const {description, id} = ctx.request.body

    try {
        if(ctx.user.role_id !=1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }

        await ManagerNote.update(
            {
                description: description,
            },
            {where: {id: id}}
        )

        const newNote = await sequelize.query(
            `SELECT manager_notes.id, manager_notes.description, manager_notes.creater_id,
                manager_notes.data_create, users.login as createrName
             FROM manager_notes
             LEFT JOIN users ON manager_notes.creater_id = users.id
             WHERE manager_notes.id = ${id}`
        )

        return ctx.body = newNote[0][0]
    }
    catch(e) {
        return ctx.body = e
    }
})

router.delete('/api/manager-note/:id', authMiddleware, async ctx => {
    try {
        if(ctx.user.role_id != 1 || ctx.user.ban == 1) {
            return ctx.status = 400
        }


        const comment = await ManagerNote.destroy({
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