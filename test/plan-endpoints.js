const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { requireAuth } = require('../src/middleware/jwt-auth')

describe('plan Endpoints', function() {
	let db 
	const { testUsers, testFolders, testPlans } = helpers.makePlansFixtures()
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

	describe('GET /api/plan', () => {
		context('Given no plans', () => {
			beforeEach( async function(){ 
				return await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })
			})
			console.log('*********', testUsers[0])
			it('responds with 200 and an empty list', () => {
				return supertest(app)
					.get('/api/plan')
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, []).catch(function(error) { console.error(error); }) 
			})
		})
		context('Given there are plans in the database', () => {
				const testPlans = helpers.makePlanArray()

				beforeEach( async function(){ 
					await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })
					return await db.insert(testPlans).into('plan').returning('id').catch(function(error) { console.error(error); })
				})
				

				it('GET /api/plan responds with 200 and all of the folders', () => {
					return supertest(app)
						.get('/api/plan')
						.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
						.expect(200)
						.expect( res => {
							expect(res.body.plan).to.eql(testPlans.plan)
						})
				})	
		})	
	})
	describe(`POST /api/plan`, () => {

		beforeEach( async function(){ 
			return await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })
		})

		it (`creates a plan, responding with 201 and the new plan`, function() {
	  		this.retries(3)
	  		const testUser = testUsers[0]
	  		const newPlan = {
	    		name: 'Test new plan',
	    		class_date: '2019-10-15',
	    		warm_up: 'Do the warm up to warm up all the muscles!',
	    		skills: 'Do the skill. Do it good.',
	    		notes: 'Need more lunges',
	    		students: 'Chlad needs more work on jumps',
	    		folder_id: 1,
	    		user_id: testUser.id,
	  		}
		  	return supertest(app)
		    	.post('/api/plan')
		    	.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
		    	.send(newPlan)
		    	.expect(201)
		    	//console.log('res', res)
		    	.expect(res => {
		    		console.log('res', res)
		      		expect(res.body).to.have.property('id')
		      		expect(res.body.name).to.eql(newPlan.name)
		      		expect(res.body.user_id).to.eql(newPlan.user_id)
		      		expect(res.body.user_id).to.eql(testUser.id)
		      		expect(res.headers.location).to.eql(`/api/plan/${res.body.id}`)
		      		const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
		      		const actualDate = new Date(res.body.date_created).toLocaleString()
		      		expect(actualDate).to.eql(expectedDate)
		    	})
		    	.expect(res =>
		      		db
		        		.from('plan')
		        		.select('*')
		        		.where({ id: res.body.id })
		        		.first()
		        		.then(row => {
		          			expect(row.name).to.eql(newPlan.name)
		          			expect(row.folder_id).to.eql(newPlan.folder_id)
		          			expect(row.user_id).to.eql(newPlan.user_id)
		          			expect(row.user_id).to.eql(testUser.id)
		          			const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
		          			const actualDate = new Date(row.date_created).toLocaleString()
		          			expect(actualDate).to.eql(expectedDate)
		        		})
		    	)
		})
		const requiredFields = ['name', 'user_id', 'folder_id']

	    requiredFields.forEach(field => {
	      const testPlan = testPlans[0]
	      const testUser = testUsers[0]
	      const newPlan = {
	        name: 'Test new plan',
	        user_id: testUser.id,
	        folder_id: 2
		    }

			it(`responds with 400 and an error message when the '${field}' is missing`, () => {
		        delete newPlan[field]

		        return supertest(app)
		          	.post('/api/plan')
		          	.set('Authorization', helpers.makeAuthHeader(testUser))
		          	.send(newPlan)
		          	.expect(400, {
		            	error: `Missing '${field}' in request body`,
		          	})
		    })
		})
	})
	describe(`GET /api/plan/:plan_id`, () => {
		context(`Given no plans`, () => {
	  		beforeEach( async function(){ 
				return await helpers.seedUsers(db, testUsers).catch(function(error) { console.error(error); })
			})

	      	it(`responds with 404`, () => {
	        	const planId = 123456
	        	return supertest(app)
	          		.get(`/api/plan/${planId}`)
	          		.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
	          		.expect(404, { error: `Plan doesn't exist` })
	      		})
	    })
		context( `Given there are plans in the database`, () => {
		    const testFolders = helpers.makeFolderArray()

			beforeEach( async function(){ 
				await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })
				return await db.insert(testPlans).into('plan').returning('id').catch(function(error) { console.error(error); })
			})

      		it('responds with 200 and the specified article', () => {
        		const planId = 2
				const expectedPlan = testPlans[planId-1]

        		return supertest(app)
          			.get(`/api/plan/${planId}`)
          			.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          			.expect(res => {
	        		//console.log('res', res)
		          		expect(res.body).to.have.property('id')
		          		expect(res.body.name).to.eql(expectedPlan.name)
		          		expect(res.body.user_id).to.eql(expectedPlan.user_id)
		          		expect(res.body.user_id).to.eql(testUsers[1].id)
		          		const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
		          		const actualDate = new Date(res.body.date_created).toLocaleString()
		          		expect(actualDate).to.eql(expectedDate)
	        		})
      		})
    	})
    })
    describe(`DELETE /api/plan/:plan_id`, () => {
    	context(`Given no plans`, () => {
      		beforeEach( async function(){ 
				return await helpers.seedUsers(db, testUsers).catch(function(error) { console.error(error); })
			})

	      	it(`responds with 404`, () => {
	        	const planId = 123456
	        	return supertest(app)
	          		.delete(`/api/plan/${planId}`)
	          		.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
	          		.expect(404, { error: `Plan doesn't exist` })
	      	})
	    })
	    context('Given there are plans in the database', () => {
		    const testFolders = helpers.makeFolderArray()

			beforeEach( async function(){ 
				await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })
				return await db.insert(testPlans).into('plan').returning('id').catch(function(error) { console.error(error); })
			})

      		it('Removes the action by ID', () => {
        		const planId = 2
        		const idToRemove = planId
				const expectedPlan = testPlans.filter(ap => ap.id !== idToRemove)
				//compare length of array or that the id is no longer in the array
				//does it handle if the id goes to another user?
        		return supertest(app)
          			.delete(`/api/plan/${planId}`)
          			.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          			.expect(204)
					.then(() => {
						return supertest(app)
							.get(`/api/plan`)
							.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
							.expect([])
				
					})
	        	
      		})
    	})
    })
    describe.only(`PATCH /api/plan/:id`, () => {
		context(`Given no plans`, () =>{
			beforeEach( async function(){ 
				return await helpers.seedUsers(db, testUsers).catch(function(error) { console.error(error); })
			})

			it(`responds with 404`, () => {
				const planId = 123
				return supertest(app)
					.patch(`/api/plan/${planId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
					.expect(404, {
						error: `Plan doesn't exist`
					})
			})
		})
		context(`Given there are plans in the database`, () => {
			const testFolders = helpers.makeFolderArray()

			beforeEach( async function(){ 
				await helpers.seedFoldersTable(db, testUsers, testFolders).catch(function(error) { console.error(error); })
				return await db.insert(testPlans).into('plan').returning('id').catch(function(error) { console.error(error); })
			})

			it('responds with 204 and updates the action', () => {
				const idToUpdate = 2
				const updatePlan = {
					name: 'updated name',
					notes: 'added some notes'
				}
				const expectedPlan = {
					...testPlans[idToUpdate - 1],
					...updatePlan
				}
				console.log('updateplan', updatePlan)
				return supertest(app)

					.patch(`/api/plan/${idToUpdate}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
					.send(updatePlan)
					.expect(204)
					.then(() => {
						return supertest(app)
							.get(`/api/plan/${idToUpdate}`)
							.set('Authorization', helpers.makeAuthHeader(testUsers[1]))
							.expect(res => {
		        		//console.log('res', res)
			          		expect(res.body.name).to.eql(expectedPlan.name)
			          		expect(res.body.notes).to.eql(expectedPlan.notes)
						})
					})
			})
		})
	})
})