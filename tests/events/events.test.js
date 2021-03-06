require('dotenv').config()
const { parser } = require('../events/events')

const messageParser = (msg) => {
    const args = msg.trim().slice(1).split(' ')
    args.forEach(a => a.trim())
    args.shift()

    return args
}

describe('First name identifier', () => {
    // Name finder
    test('should print a name "name"', () => {
        expect(parser(messageParser('.seve -name name 213 -s 18:00'))[0]).toEqual('name 213')
    })
    test('should print a name "name"', () => {
        expect(parser(messageParser('.seve -n name 213 -s 18:00'))[0]).toEqual('name 213')
    })
    test('should throw an error', () => {
        expect(() => parser(messageParser('.seve qwe q2e2 e  -s 18:00'))).toThrow()
    })
    test('should print a name "name"', () => {
        expect(parser(messageParser('.seve we qwe q -n name -s 18:00'))[0]).toEqual('name')
    })
    test('should throw an error', () => {
        expect(() => parser(messageParser('.seve qwe q2e2 -s 18:00 -n'))).toThrow()
    })
})

describe('Parts indentifier', () => {
    test('should return 3 participants', () => {
        expect(parser(messageParser('.seve -name name -p 3 -s 18:00'))[1]).toEqual(3)
    })
    test('should return null participants', () => {
        expect(parser(messageParser('.seve -name name -s 18:00'))[1]).toEqual(null)
    })
    test('should throw invalid number of participants (real)', () => {
        expect(() => parser(messageParser('.seve -name name -p 1.23 -s 18:00'))).toThrow()
    })
    test('should throw invalid number of participants (none)', () => {
        expect(() => parser(messageParser('.seve -name name  -s 18:00 -p'))).toThrow()
    })
    test('should throw invalid number of participants (negative)', () => {
        expect(() => parser(messageParser('.seve -name name -p -3 -s 18:00'))).toThrow()
    })
    test('should throw invalid number of participants (NaN)', () => {
        expect(() => parser(messageParser('.seve -name name -p wdasdw -s 18:00'))).toThrow()
    })
})

describe('Reward indentifier', () => {
    test('should return reward of 3', () => {
        expect(parser(messageParser('.seve -name name -s 18:00 -s 18:00 -r 3'))[3]).toEqual('3 Yen')
    })
    test('should return reward of null', () => {
        expect(parser(messageParser('.seve -name name -s 18:00 -s 18:00'))[3]).toEqual(null)
    })
    test('should throw invalid reward (real)', () => {
        expect(() => parser(messageParser('.seve -name name -s 18:00 -s 18:00 -r 1.23'))).toThrow()
    })
    test('should throw invalid reward (none)', () => {
        expect(() => parser(messageParser('.seve -name name -s 18:00 -s 18:00 -r'))).toThrow()
    })
    test('should throw invalid reward (negative)', () => {
        expect(() => parser(messageParser('.seve -name name -s 18:00 -s 18:00 -r -3'))).toThrow()
    })
    test('should be fine', () => {
        expect(() => parser(messageParser('.seve -name name -s 18:00 -s 18:00 -r wdasdw'))).not.toThrow()
    })
})

describe('Start indentifier', () => {
    test('should return reward of 18:00', () => {
        expect(parser(messageParser('.seve -name name -r 3 -s 18:00'))[2]).toEqual('18:00')
    })
    test('should throw an error (no ":")', () => {
        expect(() => parser(messageParser('.seve -name name -r 3 -s 18/00'))).toThrow()
    })
    test('should throw an error (less than 5)', () => {
        expect(() => parser(messageParser('.seve -name name -r 3 -s 1800'))).toThrow()
    })
    test('should throw an error (invalid args)', () => {
        expect(() => parser(messageParser('.seve -name name -r 3 -s wad a'))).toThrow()
    })
    test('should throw an error (no time)', () => {
        expect(() => parser(messageParser('.seve -name name -r 3'))[2]).toThrow()
    })
})

describe('Testing the whole command parser', () => {
    test('should be valid (only name)', () => {
        expect(() => parser(messageParser('.seve -name name -s 18:00'))).not.toThrow()
    })

    test('should throw an error (no name but marker)', () => {
        expect(() => parser(messageParser('.seve -s 18:00 -name'))).toThrow()
    })
    test('should throw an error (no name no marker)', () => {
        expect(() => parser(messageParser('.seve -s 18:00'))).toThrow()
    })

    test('should throw an error (participants real)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -p 1.32'))).toThrow()
    })
    // Look into it, participant should be in range 1-99
    test('should throw an error (participants 0)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -p 0'))).toThrow()
    })
    test('should throw an error (participants negative)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -p -100'))).toThrow()
    })
    test('should throw an error (participants NaN)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -p dwasd'))).toThrow()
    })
    test('should throw an error (participants no value)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -p'))).toThrow()
    })

    test('should throw an error (reward real)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -r 1.32'))).toThrow()
    })
    test('should throw an error (reward 0)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -r 0'))).toThrow()
    })
    test('should throw an error (reward negative)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -r -100'))).toThrow()
    })
    test('should be fine (reward NaN)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -r dwasd'))).not.toThrow()
    })
    test('should throw an error (reward no value)', () => {
        expect(() => parser(messageParser('.seve -n n -s 18:00 -r'))).toThrow()
    })

    test('should be valid (some time)', () => {
        expect(() => parser(messageParser('.seve -name name -s 18:00'))).not.toThrow()
    })
    test('should be valid (some time)', () => {
        expect(() => parser(messageParser('.seve -name name -s 00:00'))).not.toThrow()
    })
    test('should be valid (some time)', () => {
        expect(() => parser(messageParser('.seve -name name -s 23:59'))).not.toThrow()
    })
    test('should throw an error (hours > 24)', () => {
        expect(() => parser(messageParser('.seve -name name -s 24:00'))).toThrow()
    })
    test('should throw an error (minutes > 60)', () => {
        expect(() => parser(messageParser('.seve -name name -s 00:60'))).toThrow()
    })
    test('should throw an error (no time)', () => {
        expect(() => parser(messageParser('.seve -name name'))).toThrow()
    })

    test('should throw (no args)', () => {
        expect(() => parser(messageParser('.seve'))).toThrow()
    })
})
