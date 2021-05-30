/**
 * Command chain: .seve -name(n) -participants(p) -start(-s) -reward(-r)
 * @param {string[]} args
 */
module.exports.parser = (args) => {
    if(args.length <= 0)
        throw 'no args'
    const finder = (args, long, short) => {
        var res = null
        // console.log(long, args.indexOf(`- ${ long }`), args.indexOf(` - ${ short }`))
        if(args.indexOf(`-${long}`) != -1)
            res = args[args.indexOf(`-${long}`) + 1]
        else if(args.indexOf(`-${short}`) != -1)
            res = args[args.indexOf(`-${short}`) + 1]

        // console.log(res)
        return res
    }

    var name = finder(args, 'name', 'n')
    var parts = finder(args, 'participants', 'p')
    var start = finder(args, 'start', 's') //HH:MM || now
    var reward = finder(args, 'reward', 'r')


    parts ? parts = Number(parts) : null

    // console.log('reward:', reward, typeof reward)

    if(!name) throw 'название эвента не указано!'
    if(!(parts === null || parts > 0 && parts < 100 && Number.isInteger(parts)))
        throw 'неверное количество участников!'

    // Reward check
    if(Number.isInteger(Number(reward)) && reward !== undefined) {
        if(Number(reward) > 0 && reward !== null) reward += ' Yen'
        else if(reward !== null) throw 'неверная награда!'
    }
    else if(!(reward !== null && !Number(reward) && reward !== undefined) && reward !== null)
        throw 'неверная награда!'


    if(!start || start.length != 5 || start.indexOf(':') == -1 || Number(start.slice(0, 2)) >= 24 || Number(start.slice(3, 5)) >= 60)
        throw 'неверно указано время начала!'

    // return reward
    return [name, parts, start, reward]
}