const PlanService = {
	getAllPlans(knex, user_id){
		return knex
		.from('plan')
		.select('id', 'name', 'class_date', 'warm_up', 'skills', 'notes', 'students', 'folder_id', 'date_created')
		.where({ user_id })
	},
	insertPlan(knex, newPlan) {
		return knex
			.insert(newPlan)
			.into('plan')
			.returning('id', 'name', 'class_date', 'warm_up', 'skills', 'notes', 'students', 'folder_id', 'date_created')
			.then(rows => {
				return rows[0]
			})
	},
	getById(knex, id, user_id){
		return knex
			.from('plan')
			.select('id', 'name', 'class_date', 'warm_up', 'skills', 'notes', 'students', 'folder_id', 'date_created')
			.where({ id })
			.andWhere({ user_id })
			.first()
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