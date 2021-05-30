const utl = require('../../utility')
const { getGuild, Connection } = utl.db
const { activity } = require('../newActivity/newActivity')

beforeAll(async () => {
    await new Connection()
})
afterAll(async () => {
    Connection.closeAll()
})

describe('Testing new activity', () => {
    test('should return 27 ids', async () => {
        expect(await activity()).toHaveLength(27)
    })
})

