require('dotenv').config()
const assert = require('assert')
const { DBUser, Connection, DBServer, getGuild } = require('../utility/db')
const guildID = '836297404260155432'
const myID = '315339158912761856'

beforeAll(async () => {
    await new Connection()
})

afterAll(() => {
    Connection.closeAll()
})


// Conclusion: await before instancing is required
describe.skip('Database await removal when instancing a new DB element', () => {
    test('should fail without await', () => {
        const user = new DBUser('836297404260155432', '315339158912761856')

        console.log(user)

        expect(() => user.get()).toThrow()
    })

    test('should work with await now', async () => {
        const user = await new DBUser('836297404260155432', '315339158912761856')
        expect(user.get()).toBeTruthy()
    })
})

// Conclusion: fixed
describe.skip('.rcr bug fixes', () => {
    test.skip('customInv should be an empty array', async () => {
        const user = await new DBUser('836297404260155432', '315339158912761856')
        expect(user.customInv).toHaveLength(0)
    })
    test.skip('should append stuff to customInv', async () => {
        const user = await new DBUser('836297404260155432', '315339158912761856')
        const oldLength = user.customInv.length
        user.customInv.push('123')
        expect(user.customInv).toHaveLength(oldLength + 1)
    })
    test.skip('should add a new element to customInv', async () => {
        const user = await new DBUser('836297404260155432', '315339158912761856')
        if(user.customInv.length < 1)
            user.customInv.push('123')

        user.customInv.push('123')

        const lastLength = user.customInv.length
        await user.save()

        const newUser = await new DBUser('836297404260155432', '315339158912761856')
        newUser.customInv.pop()

        await newUser.save()
        expect(newUser.customInv).toHaveLength(lastLength)
    })
    test.skip('should not save customInv at all', async () => {
        const user = await new DBUser('836297404260155432', '315339158912761856')
        user.customInv.push('123')
        await user.save()

        const newUser = await new DBUser('836297404260155432', '315339158912761856')
        newUser.customInv.pop()
        await newUser.save()

        const lastUser = await new DBUser('836297404260155432', '315339158912761856')
        expect(lastUser.customInv).toHaveLength(0)
    })

    test('should print out customRoles', async () => {
        const server = await new DBServer('836297404260155432')
        console.log(server.customRoles)
        expect(server.customRoles).toHaveLength(1)
    })
})

// Conclusion: fixed
describe.skip('Custom role better counter', () => {
    test('should be 5', async () => {
        // Works very well
        const guild = await getGuild('836297404260155432')
        const members = guild.filter(m => m.customInv && m.customInv.includes('845390786174386236'))

        expect(members).toHaveLength(5)
    })
})

describe('Custom role max role holders elargment', () => {
    test.skip('should return max roles holders as 5', async () => {
        const elems = await Promise.all([
            new DBServer(guildID),
            new DBUser(guildID, myID)
        ])
        const server = elems[0]
        const user = elems[1]

        const selectedRole = user.customInv[0]
        const serverSelRole = server.customRoles.findIndex(r => r.id == selectedRole)

        expect(server.customRoles[serverSelRole].maxHolders).toEqual(5)
    })
    test('should increase max roles holder by 1', async () => {
        const elems = await Promise.all([
            new DBServer(guildID),
            new DBUser(guildID, myID)
        ])
        const server = elems[0]
        const user = elems[1]

        const selectedRole = user.customInv[0]
        const serverSelRole = server.customRoles.findIndex(r => r.id == selectedRole)

        const last = server.customRoles[serverSelRole].maxHolders
        server.customRoles[serverSelRole].maxHolders++
        await server.save()


        const newServer = await new DBServer(guildID)
        newServer.customRoles[serverSelRole].maxHolders
        expect(newServer.customRoles[serverSelRole].maxHolders).toEqual(last + 1)
    })
})