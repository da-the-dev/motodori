const { db, redisConnection } = require('../../utility')
const { DBUser } = db
const { getRedCon } = redisConnection

const { parser, saveToMongo, saveToRedis, timeCalculator } = require('../newMute/newMute')

const messageParser = (msg) => {
    const args = msg.trim().slice(1).split(' ')
    args.forEach(a => a.trim())
    args.shift()

    return args
}

beforeAll(async () => {
    // await new RedisConnection()
    // await new Connection()
})
afterAll(async () => {
    // RedisConnection.closeAll()
    // Connection.closeAll()
})

describe('Testing time parser', () => {
    test('should be valid (testing seconds)', () => {
        const data = parser(messageParser('.mute @member 12s reason'))
        expect(data.time).toEqual(12)
        expect(data.reason).toEqual('reason')
    })
    test('should be valid (testing minutes)', () => {
        const data = parser(messageParser('.mute @member 2m reason'))
        expect(data.time).toEqual(120)
        expect(data.reason).toEqual('reason')
    })
    test('should be valid (testing hours)', () => {
        const data = parser(messageParser('.mute @member 1h reason'))
        expect(data.time).toEqual(60 * 60)
        expect(data.reason).toEqual('reason')
    })
    test('should be valid (testing days)', () => {
        const data = parser(messageParser('.mute @member 2d reason'))
        expect(data.time).toEqual(2 * 24 * 60 * 60)
        expect(data.reason).toEqual('reason')
    })
    test('should be valid (testing multiple different values)', () => {
        const data = parser(messageParser('.mute @member 1s 1m 1h 1d reason'))
        expect(data.time).toEqual(1 + 60 + 3600 + 24 * 3600)
        expect(data.reason).toEqual('reason')
    })
    test('should be valid (testing multiple same values)', () => {
        const data = parser(messageParser('.mute @member 1s 1s 1s 1s reason'))
        expect(data.time).toEqual(4)
        expect(data.reason).toEqual('reason')
    })
    test('should be valid (testing multiword reason)', () => {
        const data = parser(messageParser('.mute @member 1s reason for mute'))
        expect(data.time).toEqual(1)
        expect(data.reason).toEqual('reason for mute')
    })

    test('should throw an error (no time)', () => {
        expect(() => parser(messageParser('.mute @member reason for mute'))).toThrow()
    })
    test('should throw an error (no reason)', () => {
        expect(() => parser(messageParser('.mute @member 1s'))).toThrow()
    })
    test('should throw an error (nothing)', () => {
        expect(() => parser(messageParser('.mute @member'))).toThrow()
    })
})

describe.skip('Testing saveToRedis', () => {
    test('should save a key for 10 seconds', async () => {
        await saveToRedis('315339158912761856', 10)
        expect(await getRedCon().get('mute-315339158912761856')).toEqual('')
        expect(await getRedCon().ttl('mute-315339158912761856')).toEqual(10)
    })
})

describe.skip('Testing saveToMongo', () => {
    test('should update the mute flag', async () => {
        await saveToMongo('315339158912761856', '836297404260155432')
        const user = await new DBUser('836297404260155432', '315339158912761856', true)
        expect(user.mute).toBeTruthy()
    })
})

describe('Testing time calculator', () => {
    test('should put out 1s', () => {
        expect(timeCalculator(1)).toEqual('**1**с')
    })
    test('should put out 10s', () => {
        expect(timeCalculator(10)).toEqual('**10**с')
    })
    test('should put out 1m', () => {
        expect(timeCalculator(60)).toEqual('**1**м')
    })
    test('should put out 10m', () => {
        expect(timeCalculator(600)).toEqual('**10**м')
    })
    test('should put out 1h', () => {
        expect(timeCalculator(3600)).toEqual('**1**ч')
    })
    test('should put out 10h', () => {
        expect(timeCalculator(36000)).toEqual('**10**ч')
    })
    test('should put out 1d', () => {
        expect(timeCalculator(24 * 3600)).toEqual('**1**д')
    })
    test('should put out 10d', () => {
        expect(timeCalculator(10 * 24 * 60 * 60)).toEqual('**10**д')
    })
    test('should put out 1s 1m 1h 1d', () => {
        expect(timeCalculator(1 + 60 + 60 * 60 + 24 * 60 * 60)).toEqual('**1**д **1**ч **1**м **1**с')
    })
})
