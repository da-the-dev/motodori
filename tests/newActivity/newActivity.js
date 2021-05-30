const utl = require('../../utility')
const { getGuild } = utl.db
/**
 * @param {string} id
 */
module.exports.activity = async id => {
    var total = [];
    const guild = await getGuild('836297404260155432')
    guild.forEach(m => {
        const member = guild.member(m.id)
        if(!member) return

        if(m.msgs >= 1000 || m.voiceTime >= 600) {
            console.log(member.user.id, m.msgs, m.voiceTime)
            total.push(m.id)
        }
    })
    return total
}

// { $or: [{ msgs: { $gte: 1000 } }, { voiceTime: { $gte: 600 } }] }