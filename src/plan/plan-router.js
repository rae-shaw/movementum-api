const path = require('path')
const express = require('express')
const PlanService = require('./plan-service')
const { requireAuth } = require('../middleware/jwt-auth')

const planRouter = express.Router()
const jsonParser = express.json()
const serializePlan = plan => ({
	id: plan.id,
	name: plan.name,
	class_date: plan.class_date,
	warm_up: plan.warm_up,
	skills: plan.skills,
	notes: plan.notes,
	students: plan.students,
	user_id: plan.user_id,
	folder_id: plan.folder_id,
	date_created: plan.date_created
})

planRouter
	.route('/')
	.all(requireAuth)
	.get((req, res, next) => {
		const knexInstance = req.app.get('db')
		console.log('********** req.user', req.user)
		PlanService.getAllPlans(knexInstance, req.user.id)
			.then(plans => {
				res.json(plans.map(serializePlan))
			})
		.catch(next)
	})
	.post(jsonParser, (req, res, next) => {
		const { name, class_date, warm_up, skills, notes, students, folder_id, date_created } = req.body
		console.log(req.body)
		planReq = { name, folder_id }
		console.log('PLANREQ', planReq)
	
			// for (const [key, value] of Object.entries())
   //    			if (value == null)
   //      			return res.status(400).json({
   //       				 error: `Missing '${key}' in request body`
   //      		})
        const newPlan ={
       		name, class_date, warm_up, skills, notes, students, folder_id, date_created, user_id: req.user.id
       	}
		PlanService.insertPlan(
			req.app.get('db'),
			newPlan
		)
			.then(plan => {
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${plan.id}`))
					.json(plan)
			})
			.catch(next)
	})

planRouter
	.route('/:id')
	.all(requireAuth)
	.all((req, res, next) => {
		PlanService.getById(req.app.get('db'), req.params.id, req.user.id)
			.then(plan => {
				if(!plan) {
					return res.status(404).json({
						error : `Plan doesn't exist`
					})
				}
				res.plan = plan
				next()
			})
			.catch( error => console.log('caught error ' , error))
		})

	.get((req, res, next) => {
		res.json(serializePlan(res.plan))
	})
	.delete((req, res, next) => {
		PlanService.deletePlan(
			req.app.get('db'),
			req.params.id,
			req.user.id
		)
			.then(numRowsAffected => {
				res.status(204).end()
			})
			.catch(next)
	})
	.patch(jsonParser, (req, res, next) => {
		//const { id, user_id } = req.body

		console.log('**************** req.body', req.body)
	
		const { name, class_date, warm_up, skills, notes, students } = req.body
		planReq = { name, class_date, warm_up, skills, notes, students }

		const numberOfValues = Object.values(planReq).filter(Boolean).length
			if (numberOfValues === 0) {
				return res.status(400).json({
					error: { message: `Request body must contain at least one field to be updated`}
				})
			}

		PlanService.updatePlan(
			req.app.get('db'),
			req.params.id,
			req.user.id,
			req.body
			)
		.then(numRowsAffected => {
					res.status(204).end()
				})
				.catch(next)
	})


module.exports = planRouter


