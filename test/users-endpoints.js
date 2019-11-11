const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Users Endpoints', function() {
    let db

    const { testUsers } = helpers.makePlansFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/users`, () => {
        context(`User Validation`, () => {
        beforeEach('insert users', async function() {
            return await helpers.seedUsers(
                db,
                testUsers,
            )
        })

        const requiredFields = ['name', 'password', 'full_name']

        requiredFields.forEach(field => {
            const registerAttemptBody = {
                name: 'test user_name',
                password: 'test password',
                full_name: 'test full_name',
            }

        it(`responds with 400 required error when '${field}' is missing`, () => {
            delete registerAttemptBody[field]

            return supertest(app)
                .post('/api/users')
                .send(registerAttemptBody)
                .expect(400, {
                error: `Missing '${field}' in request body`,
            })
        })
      })
    })
  })
})