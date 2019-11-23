const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { requireAuth } = require('../src/middleware/jwt-auth')

describe('folder Endpoints', function() {
	let db 
	const { testUsers, testFolders } = helpers.makePlansFixtures()
	console.log('********testUsers in test file', testUsers)

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DB_URL,
		})
		app.set('db', db)
		db.debug()
	})

 	before('cleanup', () => { 
 		return helpers.cleanTables(db).catch(function(error) { console.error(error); }) })

  	afterEach('cleanup', () => { 
  		return helpers.cleanTables(db).catch(function(error) { console.error(error); }) })

	after('disconnect from db', () => db.destroy())

	describe('GET /api/folder', () => {
		context('Given no folders', () => {
			beforeEach( async function(){ 
				return await helpers.seedFoldersTable(db, testUsers).catch(function(error) { console.error(error); })
			})
			
			it('responds with 200 and an empty list', () => {
				return supertest(app)
					.get('/api/folder')
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, []).catch(function(error) { console.error(error); }) 
			})
		})
		context('Given there are folders in the database', () => {
			const testFolders = helpers.makeFolderArray()

			beforeEach( async function(){ 
				return await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })

			})
			


			it('GET /api/folder responds with 200 and all of the folders', () => {
				return supertest(app)
					.get('/api/folder')
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200)
					.expect( res => {
						expect(res.body.folder).to.eql(testFolders.folder)
					})
			})
				
		})
	})

	describe(`POST /api/folder`, () => {

		beforeEach( async function(){ 
				return await helpers.seedUsers(db, testUsers).catch(function(error) { console.error(error); })
		})

		it (`creates a folder, responding with 201 and the new folder`, function() {
      		this.retries(3)
      		const testUser = testUsers[0]
      		const newFolder = {
        		name: 'Test new folder',
        		user_id: testUser.id,
      		}
      	return supertest(app)
        	.post('/api/folder')
        	.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        	.send(newFolder)
        	.expect(201)
        	//console.log('res', res)
        	.expect(res => {
        		console.log('res', res)
          		expect(res.body).to.have.property('id')
          		expect(res.body.name).to.eql(newFolder.name)
          		expect(res.body.user_id).to.eql(newFolder.user_id)
          		expect(res.body.user_id).to.eql(testUser.id)
          		expect(res.headers.location).to.eql(`/api/folder/${res.body.id}`)
          		const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
          		const actualDate = new Date(res.body.date_created).toLocaleString()
          		expect(actualDate).to.eql(expectedDate)
        	})
        	.expect(res =>
          		db
            		.from('folder')
            		.select('*')
            		.where({ id: res.body.id })
            		.first()
            		.then(row => {
              			expect(row.name).to.eql(newFolder.name)
              			expect(row.user_id).to.eql(newFolder.user_id)
              			expect(row.user_id).to.eql(testUser.id)
              			const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
              			const actualDate = new Date(row.date_created).toLocaleString()
              			expect(actualDate).to.eql(expectedDate)
            		})
        	)
    	})

	    const requiredFields = ['name', 'user_id']

	    requiredFields.forEach(field => {
	      const testFolder = testFolders[0]
	      const testUser = testUsers[0]
	      const newFolder = {
	        name: 'Test new folder',
	        user_id: testUser.id,
		    }

			it(`responds with 400 and an error message when the '${field}' is missing`, () => {
		        delete newFolder[field]

		        return supertest(app)
		          	.post('/api/folder')
		          	.set('Authorization', helpers.makeAuthHeader(testUser))
		          	.send(newFolder)
		          	.expect(400, {
		            	error: `Missing '${field}' in request body`,
		          	})
		    })
		})
	})
	describe(`GET /api/folder/:folder_id`, () => {
    	context(`Given no folders`, () => {
      		beforeEach( async function(){ 
				return await helpers.seedUsers(db, testUsers).catch(function(error) { console.error(error); })
			})

	      	it(`responds with 404`, () => {
	        	const folderId = 123456
	        	return supertest(app)
	          		.get(`/api/folder/${folderId}`)
	          		.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
	          		.expect(404, { error: `Folder doesn't exist` })
	      		})
	    })
    	context( `Given there are folders in the database`, () => {
		    const testFolders = helpers.makeFolderArray()

			beforeEach( async function(){ 
				return await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })
			})

      		it('responds with 200 and the specified article', () => {
        		const folderId = 2
				const expectedFolder = testFolders[folderId-1]

        		return supertest(app)
          			.get(`/api/folder/${folderId}`)
          			.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          			.expect(res => {
	        		//console.log('res', res)
		          		expect(res.body).to.have.property('id')
		          		expect(res.body.name).to.eql(expectedFolder.name)
		          		expect(res.body.user_id).to.eql(expectedFolder.user_id)
		          		expect(res.body.user_id).to.eql(testUsers[1].id)
		          		const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
		          		const actualDate = new Date(res.body.date_created).toLocaleString()
		          		expect(actualDate).to.eql(expectedDate)
	        		})
      		})
    	})
    })
    describe(`DELETE /api/folder/:folder_id`, () => {
    	context(`Given no folders`, () => {
      		beforeEach( async function(){ 
				return await helpers.seedUsers(db, testUsers).catch(function(error) { console.error(error); })
		})

      	it(`responds with 404`, () => {
        	const folderId = 123456
        	return supertest(app)
          		.delete(`/api/folder/${folderId}`)
          		.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          		.expect(404, { error: `Folder doesn't exist` })
      		})
    	})
    	context('Given there are folders in the database', () => {
		    const testFolders = helpers.makeFolderArray()

			beforeEach( async function(){ 
				return await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })
			})

      		it('Removes the action by ID', () => {
        		const folderId = 2
        		const idToRemove = folderId
				const expectedFolder = testFolders.filter(ap => ap.id !== idToRemove)

        		return supertest(app)
          			.delete(`/api/folder/${folderId}`)
          			.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          			.expect(204)
					.then(() => {
						return supertest(app)
							.get(`/api/folder`)
							.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
							.expect(test)
				
					})
	        	
      		})
    	})
    })

})


// 	})
// })
