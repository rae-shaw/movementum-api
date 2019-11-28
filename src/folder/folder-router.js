const path = require('path')
const express = require('express')
const FolderService = require('./folder-service')
const { requireAuth } = require('../middleware/jwt-auth')

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
	.all(requireAuth)
	.get((req, res, next) => {
		const knexInstance = req.app.get('db')
		FolderService.getAllFolders(knexInstance, req.user.id)
			.then(folders => {
				res.json(folders.map(serializeFolder))
			})
		.catch(next)
	})
	.post(jsonParser, (req, res, next) => {
		const { name } = req.body
		folderReq = { name }
	
			for (const [key, value] of Object.entries(folderReq))
      			if (value == null)
        			return res.status(400).json({
         				 error: `Missing '${key}' in request body`
        		})
       	const newFolder ={
       		name, user_id: req.user.id
       	}
		FolderService.insertFolder(
			req.app.get('db'),
			newFolder
		)
			.then(folder=> {
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${folder.id}`))
					.json(folder)
			})
			.catch(next)
	})

folderRouter
	.route('/:id')
	.all(requireAuth)
	.all((req, res, next) => {
		FolderService.getById(req.app.get('db'), req.params.id, req.user.id)
			.then(folder => {
				if(!folder) {
					return res.status(404).json({
						error : `Folder doesn't exist`
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
			req.params.id,
			req.user.id
		)
			.then(numRowsAffected => {
				res.status(204).end()
			})
			.catch(next)
	})


module.exports = folderRouter


