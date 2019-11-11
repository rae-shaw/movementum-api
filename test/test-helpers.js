const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

    function makeUsersArray() {
        return [
            {
                user_name: 'test-user-1',
                full_name: 'Test user 1',
                password: 'password',
                date_created: new Date('2029-01-22T16:28:32.615Z'),
            },
            {
                user_name: 'test-user-2',
                full_name: 'Test user 2',
                password: 'password',
                date_created: new Date('2029-01-22T16:28:32.615Z'),
            },
            {
                user_name: 'test-user-3',
                full_name: 'Test user 3',
                password: 'password',
                date_created: new Date('2029-01-22T16:28:32.615Z'),
            },
            {
                user_name: 'test-user-4',
                full_name: 'Test user 4',
                password: 'password',
                date_created: new Date('2029-01-22T16:28:32.615Z'),
            },
        ]
    }

    function cleanTables(db) {
        return db.transaction(trx =>
            trx.raw(
              `TRUNCATE
                users,
                folder,
                plan
              `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE folder_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE plan_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('users_id_seq', 0)`),
                    trx.raw(`SELECT setval('folder_id_seq', 0)`),
                    trx.raw(`SELECT setval('plan_id_seq', 0)`),
                ])
            )
        )
    }

    function makeCurriculumFixtures() {
        const testUsers = makeUsersArray()
        return { testUsers }
    }

    function seedUsers(db, users) {
        const preppedUsers = users.map(user => ({
            ...user,
            password: bcrypt.hashSync(user.password, 1)
        }))
        return db.into('users').insert(preppedUsers)
            .then(() =>
            // update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('users_id_seq', ?)`,
                [users[users.length - 1].id],
            )
        )
    }

    function makeFolderArray(){
        return [
            {
                name: 'lyra 1',
                user_id: 1
            },
            {
                name: 'trapeze 2',
                user_id: 2
            },
            {
                name: 'hammock 3',
                user_id: 3
            },
        ];
    }

    function makePlansFixtures() {
        const testUsers = makeUsersArray()
        return { testUsers }
    }


module.exports = {
    makeUsersArray,
    makeFolderArray,

    makeCurriculumFixtures,
    makePlansFixtures,
    cleanTables,
    seedUsers,
}