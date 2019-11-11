const PlanService = {
	getAllFolders(knex){
		return knex
		.from('plan')
		.select('*')
		.where({ user_id })
	},
	insertFolder(knex, newPlan) {
		console.log(newPlan)
		return knex
			.insert(newPlan)
			.into('plan')
			.returning('*')
			.then(rows => {
				return rows[0]
			})
	},
	getById(knex, id){
		return knex
			.from('plan')
			.select('*')
			.where({ id })
			.first()
			//do I need the userID here too?
	},
	deletePlan(knex, id){
		return knex('plan')
			.where({ id })
			.delete()
	},
	updatePlan(knex, id, updatedFields){
		return knex('plan')
			.where({ id })
			.update(updatedFields)
	},

}

module.exports = PlanService