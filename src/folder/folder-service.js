const FolderService = {
	getAllFolders(knex, user_id){
		return knex
		.from('folder')
		.select('*')
		.where({ user_id })
	},
	insertFolder(knex, newFolder) {
		console.log(newFolder)
		return knex
			.insert(newFolder)
			.into('folder')
			.returning('*')
			.then(rows => {
				return rows[0]
			})
	},
	getById(knex, id){
		return knex
			.from('folder')
			.select('*')
			.where({ id })
			.first()
			//do I need the userID here too?
	},
	deleteFolder(knex, id){
		return knex('folder')
			.where({ id })
			.delete()
	},
}

module.exports = FolderService