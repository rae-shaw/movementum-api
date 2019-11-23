const FolderService = {
	getAllFolders(knex, user_id){
		return knex
		.from('folder')
		.select('*')
		.where({ user_id })
	},
	insertFolder(knex, newFolder) {
		return knex
			.insert(newFolder)
			.into('folder')
			.returning('*')
			.then(rows => {
				return rows[0]
			})
	},
	getById(knex, id, user_id ){
		return knex
			.from('folder')
			.select('*')
			.where({ id })
			.andWhere({ user_id })
			.first()
	},
	deleteFolder(knex, id, user_id){
		return knex('folder')
			.where({ id })
			.andWhere({ user_id })
			.delete()
	},
}

module.exports = FolderService