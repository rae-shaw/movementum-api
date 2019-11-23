const PlanService = {
	getAllPlans(knex, user_id){
		return knex
		.from('plan')
		.select('*')
		.where({ user_id })
	},
	insertPlan(knex, newPlan) {
		console.log(newPlan)
		return knex
			.insert(newPlan)
			.into('plan')
			.returning('*')
			.then(rows => {
				return rows[0]
			})
	},
	getById(knex, id, user_id){
		return knex
			.from('plan')
			.select('*')
			.where({ id })
			.andWhere({ user_id })
			.first()
			//do I need the userID here too?
	},
	deletePlan(knex, id, user_id){
		return knex('plan')
			.where({ id })
			.delete()
	},
	updatePlan(knex, id, user_id, updatedFields){
		return knex('plan')
			.where({ id })
			.andWhere({ user_id })
			.update(updatedFields)
	},

}

module.exports = PlanService