const path = require('path')
const express = require('express')
const FolderService = require('./folder-service')

const folderRouter = express.Router()
const jsonParser = express.json()
const serializeFolder = folder => ({
	id: folder.id,
	name: folder.name,
	user_id: folder.user_id,
	date_created: folder.date_created
})

folderRouter
	.route('/')
	.get((req, res, next) => {
		const knexInstance = req.app.get('db')
		FolderService.getAllFolders(knexInstance, user_id)
			.then(folders => {
				res.json(folders.map(serializeFolder))
			})
		.catch(next)
	})
	.post(jsonParser, (req, res, next) => {
		const folder = req.body
	
			if (folder.name == undefined) {
				return res.status(400).json({
					error: { message: `Missing folder name in request body`}
				})
			}
		FolderService.insertFolder(
			req.app.get('db'),
			req.body
		)
			.then(folder=> {
				res
					.status(201)
					.json(folder)
			})
			.catch(next)
	})

folderRouter
	.route('/:id')
	.all((req, res, next) => {
		FolderService.getById(req.app.get('db'), req.params.id)
			.then(folder => {
				if(!folder) {
					return res.status(404).json({
						error: { message: `Folder Not Found`}
					})
				}
				res.folder = folder
				next()
			})
			.catch( error => console.log('caught error ' , error))
		})

	.get((req, res, next) => {
		res.json(serializeFolder(res.folder))
	})
	.delete((req, res, next) => {
		FolderService.deleteFolder(
			req.app.get('db'),
			req.params.id
		)
			.then(numRowsAffected => {
				res.status(204).end()
			})
			.catch(next)
	})


module.exports = folderRouter


