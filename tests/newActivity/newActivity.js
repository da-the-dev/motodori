/**
 * Increments money and time fields for all current active members every minute
 * @param {Discord.Guild} guild
 */
module.exports.voiceAct = (guild) => {
    setInterval(async () => {
        var prepedVoiceActs = voiceActs.map(a => { return { id: a } })
        if(prepedVoiceActs.length > 0) {
            var update = { $inc: { money: 1, voiceTime: 1 } }
            getConnection().updateMany('836297404260155432', { $or: prepedVoiceActs }, update)
        }

        (await getGuild('836297404260155432')).forEach(m => {
            const member = guild.member(m.id)
            if((m.msgs >= 1000 || m.voiceTime >= 100 * 60) && member && member.roles.cache.has(constants.roles.active)) {
                console.log(member.user.id, m.msgs)
                member.roles.add(constants.roles.active)
            }
        })
    }, 6000)
}

{ $or: [{ msgs: { $gte: 1000 } }, { voiceTime: { $gte: 600 } }] }